from fastapi import FastAPI, Form, HTTPException, Query
from fastapi.responses import Response
from app.gemini import ask_gemini
from app.twilio_client import client
from app.config import TWILIO_PHONE_NUMBER, CAREGIVER_PHONE, BASE_URL, MATCH_USER_PHONE
from app.users import USERS, get_user_by_phone
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import quote
import datetime
import uuid

app = FastAPI(title="Hey Gran Backend")

# CORS — must be set up before routes so all responses include CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory call history store
MOCK_HISTORY = []

class TriggerCallRequest(BaseModel):
    phone: str
    profile_id: str = ""

class UpdatePhoneRequest(BaseModel):
    phone: str

def classify_risk(user_text: str):

    prompt = f"""
You are a health risk classifier for an elderly wellness check call.

Classify the following statement into one category:

LOW_RISK
MEDIUM_RISK
HIGH_RISK
EMERGENCY

Statement: "{user_text}"

Return ONLY the category.
"""

    result = ask_gemini(prompt)

    return result.strip()

def ask_lonely_confirmation(profile_id, caller):

    twiml = f"""
<Response>

<Say voice="Polly.Amy-Neural">
It sounds like you might enjoy speaking with someone.
</Say>

<Say voice="Polly.Amy-Neural">
I know another person who enjoys gardening too.
Would you like me to try connecting you?
</Say>

<Say voice="Polly.Amy-Neural">
Press 1 for yes, or press 2 to continue chatting with me.
</Say>

<Gather numDigits="1"
action="{BASE_URL}/lonely-confirm?profile_id={profile_id}&amp;caller={quote(caller)}" />

</Response>
"""

    return Response(content=twiml, media_type="application/xml")


@app.get("/")
def root():
    return {"message": "Hey Gran backend running"}

# ---------------------------------------------------------------------------
# Profile endpoints
# ---------------------------------------------------------------------------

@app.get("/profiles")
def get_profiles():
    return list(USERS.values())

@app.get("/profiles/{profile_id}")
def get_profile(profile_id: str):
    profile = USERS.get(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")
    return profile

@app.patch("/profiles/{profile_id}")
def update_profile_phone(profile_id: str, req: UpdatePhoneRequest):
    profile = USERS.get(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")
    USERS[profile_id]["phone"] = req.phone
    return USERS[profile_id]


@app.post("/call-user")
def call_user(phone: str, profile_id: str = ""):

    call = client.calls.create(
        to=phone,
        from_=TWILIO_PHONE_NUMBER,
        url=f"{BASE_URL}/voice/start?profile_id={profile_id}"
    )

    return {"status": "calling", "call_sid": call.sid}

@app.post("/voice/start")
def voice_start(profile_id: str = "", From: str = Form(default="")):

    profile = USERS.get(profile_id) or get_user_by_phone(From) or {}
    name = profile.get("name", "there")
    first_name = profile.get("firstName", name)
    conditions = profile.get("conditions", [])

    prompt = f"""
You are Hey Gran, a warm and friendly wellness check-in service calling an elderly person.

Name: {name}
Known conditions: {conditions}

Generate a short, warm greeting and ONE open-ended question to start a conversation.
For example: "How have you been feeling lately?" or "Have you been sleeping well?"
Keep it to 2 sentences max. Do NOT say you are an AI.
"""

    question = ask_gemini(prompt)

    twiml = f"""
<Response>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto">
<Say voice="Polly.Amy-Neural">Hello {first_name}, this is Hey Gran checking in.</Say>
<Pause length="1"/>
<Say voice="Polly.Amy-Neural">{question}</Say>
</Gather>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")


@app.post("/voice/process")
def voice_process(profile_id: str = "", SpeechResult: str = Form(default=""), From: str = Form(default="")):

    transcript = SpeechResult.lower()

    lonely_keywords = [
        "lonely",
        "alone",
        "talk to someone",
        "someone to talk to",
        "feeling lonely",
    ]

    if any(k in transcript for k in lonely_keywords):
        return ask_lonely_confirmation(profile_id, From)

    profile = USERS.get(profile_id) or get_user_by_phone(From) or {}
    name = profile.get("name", "Unknown User")
    first_name = profile.get("firstName", name)

    exit_keywords = ["no", "no thank you", "that's all", "nothing else", "goodbye", "bye"]

    if any(k in transcript for k in exit_keywords):

        riddle = ask_gemini("""
Give a short fun riddle suitable for an elderly person.
Return only the riddle.
""")

        twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">Alright, it was lovely chatting with you.</Say>
<Say voice="Polly.Amy-Neural">Before I go, here's a little riddle.</Say>
<Say voice="Polly.Amy-Neural">{riddle}</Say>
<Pause length="1"/>
<Say voice="Polly.Amy-Neural">Take care {first_name}. I'll check in again soon.</Say>
<Hangup/>
</Response>
"""

        return Response(content=twiml, media_type="application/xml")

    risk = classify_risk(transcript)

    print("Transcript:", transcript)
    print("Risk level:", risk)

    if risk in ["HIGH_RISK", "EMERGENCY"]:
        client.messages.create(
            body=f"Hey Gran Alert: {name} reported '{transcript}'",
            from_=TWILIO_PHONE_NUMBER,
            to=CAREGIVER_PHONE
        )

    response_prompt = f"""
You are Hey Gran, a friendly wellness check-in service speaking to {first_name}, an elderly person.

IMPORTANT RULES:
- Never say you are an AI.
- Be warm, calm, and conversational.
- Respond to what they said, then ask a natural follow-up question to keep the conversation going.
- Keep your total response under 30 words.

They said: "{transcript}"
"""

    ai_reply = ask_gemini(response_prompt)

    new_call = {
        "id": f"real-{int(datetime.datetime.now().timestamp())}",
        "name": name,
        "title": f"{name}'s AI Check-In",
        "timestamp": datetime.datetime.now().replace(microsecond=0).isoformat(),
        "duration": "Unknown",
        "mood": "Neutral" if risk == "LOW_RISK" else "Flagged",
        "moodEmoji": "😊" if risk == "LOW_RISK" else "😐",
        "summary": f"Call completed. Risk level: {risk}. User said: '{transcript[:100]}'",
        "transcript": f"{name}: {transcript}\nAI: {ai_reply}",
        "flagged": risk in ["HIGH_RISK", "EMERGENCY"],
    }

    MOCK_HISTORY.insert(0, new_call)
    if len(MOCK_HISTORY) > 5:
        MOCK_HISTORY.pop()

    twiml = f"""
<Response>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto">
<Say voice="Polly.Amy-Neural">{ai_reply}</Say>
</Gather>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")

@app.post("/lonely-confirm")
def lonely_confirm(
    Digits: str = Form(...),
    caller: str = Query(...),
    profile_id: str = Query("")
):

    if Digits == "1":

        if not MATCH_USER_PHONE:
            twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">I'm sorry, I couldn't find anyone available right now. Let's keep chatting.</Say>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto"/>
</Response>
"""
            return Response(content=twiml, media_type="application/xml")

        room_name = f"heygran-{uuid.uuid4().hex[:8]}"

        try:
            outbound = client.calls.create(
                to=MATCH_USER_PHONE,
                from_=TWILIO_PHONE_NUMBER,
                url=f"{BASE_URL}/lonely-invite?caller={quote(caller)}&room={room_name}"
            )
            print(f"Outbound call to {MATCH_USER_PHONE}: SID={outbound.sid}")
        except Exception as e:
            print(f"Failed to call MATCH_USER_PHONE ({MATCH_USER_PHONE}): {e}")
            twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">I'm sorry, I couldn't reach anyone right now. Let's keep chatting.</Say>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto"/>
</Response>
"""
            return Response(content=twiml, media_type="application/xml")

        twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">
Alright, let me see if they are available. Please hold for a moment.
</Say>
<Dial timeout="45">
<Conference startConferenceOnEnter="true" endConferenceOnExit="true" waitUrl="http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical">{room_name}</Conference>
</Dial>
<Say voice="Polly.Amy-Neural">It looks like they weren't available this time. Let's continue our chat.</Say>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto">
<Say voice="Polly.Amy-Neural">Is there anything else on your mind?</Say>
</Gather>
</Response>
"""

    else:

        twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">
No problem at all. I'm happy to keep chatting with you.
</Say>
<Gather input="speech" action="{BASE_URL}/voice/process?profile_id={profile_id}" method="POST" speechTimeout="auto"/>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")

@app.post("/lonely-response")
def lonely_response(
    Digits: str = Form(...),
    room: str = Query(...)
):

    if Digits == "1":

        twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">Connecting you now.</Say>
<Dial>
<Conference startConferenceOnEnter="true" endConferenceOnExit="true">{room}</Conference>
</Dial>
</Response>
"""
    else:

        twiml = """
<Response>
<Say voice="Polly.Amy-Neural">No problem. Have a lovely day.</Say>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")

@app.post("/lonely-invite")
def lonely_invite(caller: str = Query(...), room: str = Query(...)):
    profile = get_user_by_phone(caller) or {}
    name = profile.get("firstName", "Someone")
    twiml = f"""
<Response>
<Say voice="Polly.Amy-Neural">
Hello. This is Hey Gran calling.
{name} would like someone to talk to.
</Say>
<Say voice="Polly.Amy-Neural">
Press 1 if you would like to chat now.
Press 2 if you are unavailable.
</Say>
<Gather numDigits="1" action="{BASE_URL}/lonely-response?room={room}"/>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")

@app.post("/caregiver/trigger-call")
def caregiver_trigger_call(user_phone: str, profile_id: str = ""):
    try:
        call = client.calls.create(
            to=user_phone,
            from_=TWILIO_PHONE_NUMBER,
            url=f"{BASE_URL}/voice/start?profile_id={profile_id}"
        )
        return {"status": "call_started", "call_sid": call.sid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/trigger-call")
def trigger_call_from_frontend(req: TriggerCallRequest):
    return caregiver_trigger_call(user_phone=req.phone, profile_id=req.profile_id)

@app.get("/call-history")
def get_call_history():
    return MOCK_HISTORY
