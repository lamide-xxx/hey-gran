from fastapi import FastAPI, Form, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from app.gemini import ask_gemini, chat_completion
from app.twilio_client import client
from app.config import TWILIO_PHONE_NUMBER, CAREGIVER_PHONE, BASE_URL, MATCH_USER_PHONE
from app.users import USERS, get_user_by_phone
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import quote
import asyncio
import datetime
import html
import json
import uuid

app = FastAPI(title="Hey Gran Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_HISTORY = []

# Active ConversationRelay sessions keyed by callSid
SESSIONS: dict[str, dict] = {}


class TriggerCallRequest(BaseModel):
    phone: str
    profile_id: str = ""


class UpdatePhoneRequest(BaseModel):
    phone: str


def classify_risk(user_text: str):
    prompt = f"""
You are a cautious health risk classifier for an elderly wellness check call.
When in doubt, always classify HIGHER rather than lower. Elderly people often understate how they feel.

Classify the following statement into one category:

LOW_RISK — Feeling good, positive, normal day, no complaints at all.
MEDIUM_RISK — Minor complaints like tiredness, slight aches, feeling a bit off, not sleeping well, mild loneliness.
HIGH_RISK — Any mention of pain, dizziness, shortness of breath, falling, not eating, confusion, feeling unwell, feeling sad or down, missed medication, not feeling right, or anything that could indicate a health concern.
EMERGENCY — Chest pain, can't breathe, fell and can't get up, severe pain, asking for help urgently.

Important: If the person mentions ANY physical symptom, discomfort, or emotional distress, classify as HIGH_RISK or above. Only classify as LOW_RISK if they are clearly happy and well.

Statement: "{user_text}"

Return ONLY the category name (i.e. LOW_RISK, MEDIUM_RISK, HIGH_RISK, EMERGENCY).
"""
    result = ask_gemini(prompt)
    return result.strip()


def _build_ws_url() -> str:
    return BASE_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"


def _save_call_history(session: dict, risk: str):
    name = session.get("name", "Unknown")
    transcript_text = "\n".join(session.get("transcript_parts", []))

    new_call = {
        "id": f"real-{int(datetime.datetime.now().timestamp())}",
        "name": name,
        "title": f"{name}'s AI Check-In",
        "timestamp": datetime.datetime.now().replace(microsecond=0).isoformat(),
        "duration": "Unknown",
        "mood": "Neutral" if risk == "LOW_RISK" else "Flagged",
        "moodEmoji": "😊" if risk == "LOW_RISK" else "😐",
        "summary": f"Call completed. Risk level: {risk}.",
        "transcript": transcript_text,
        "flagged": risk in ["HIGH_RISK", "EMERGENCY"],
    }

    MOCK_HISTORY.insert(0, new_call)
    if len(MOCK_HISTORY) > 5:
        MOCK_HISTORY.pop()


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Call triggers
# ---------------------------------------------------------------------------

@app.post("/call-user")
def call_user(phone: str, profile_id: str = ""):
    call = client.calls.create(
        to=phone,
        from_=TWILIO_PHONE_NUMBER,
        url=f"{BASE_URL}/voice/start?profile_id={profile_id}"
    )
    return {"status": "calling", "call_sid": call.sid}


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


# ---------------------------------------------------------------------------
# Voice webhook — returns ConversationRelay TwiML
# ---------------------------------------------------------------------------

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

Generate ONE warm, open-ended question to check in on them.
Tailor the question to their known conditions when possible.
For example, if they have diabetes you might ask about their blood sugar or eating habits.
If they have hypertension, you might ask how their energy levels have been.
Do NOT start with a greeting like "Hello" or "Hi" — the greeting has already been said.
Do NOT use medical jargon — keep it natural and conversational.
Keep it to 1 sentence. Do NOT say you are an AI.
"""

    question = ask_gemini(prompt)

    greeting = f"Hello {first_name}, this is Hey Gran checking in. {question}"
    safe_greeting = html.escape(greeting, quote=True)
    safe_question = html.escape(question, quote=True)
    ws_url = _build_ws_url()

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect action="{BASE_URL}/connect-action">
    <ConversationRelay url="{ws_url}"
      ttsProvider="ElevenLabs"
      voice="AXdMgz6evoL7OPd7eU12"
      welcomeGreeting="{safe_greeting}"
      dtmfDetection="true"
      interruptible="true">
      <Parameter name="profileId" value="{html.escape(profile_id, quote=True)}" />
      <Parameter name="firstQuestion" value="{safe_question}" />
    </ConversationRelay>
  </Connect>
</Response>"""

    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# WebSocket endpoint for ConversationRelay
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = None

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "setup":
                session_id = message["callSid"]
                caller_phone = message.get("from", "")
                custom_params = message.get("customParameters", {})
                profile_id = custom_params.get("profileId", "")
                first_question = custom_params.get("firstQuestion", "")

                profile = USERS.get(profile_id) or get_user_by_phone(caller_phone) or {}
                name = profile.get("name", "there")
                first_name = profile.get("firstName", name)
                conditions = profile.get("conditions", [])
                conditions_text = ", ".join(c["name"] for c in conditions) if conditions else "None known"

                system_prompt = (
                    f"You are Hey Gran, a warm and friendly wellness check-in service "
                    f"speaking to {first_name}, an elderly person.\n"
                    f"Known conditions: {conditions_text}\n\n"
                    "IMPORTANT RULES:\n"
                    "- Never say you are an AI or a bot.\n"
                    "- Be warm, calm, and conversational like a caring friend.\n"
                    "- Respond to what they said, then ask a natural follow-up question.\n"
                    "- Tailor questions to their known conditions when possible.\n"
                    "- Keep responses under 30 words.\n"
                    "- Do NOT use emojis, asterisks, or special characters.\n"
                    "- Spell out numbers (e.g. twenty not 20).\n"
                    "- Do NOT use medical jargon — keep it natural.\n"
                )

                messages = [{"role": "system", "content": system_prompt}]
                if first_question:
                    messages.append({"role": "assistant", "content": first_question})

                SESSIONS[session_id] = {
                    "messages": messages,
                    "profile": profile,
                    "profile_id": profile_id,
                    "caller_phone": caller_phone,
                    "name": name,
                    "first_name": first_name,
                    "transcript_parts": [],
                    "phase": "normal",
                    "worst_risk": "LOW_RISK",
                }

                print(f"ConversationRelay setup for call {session_id} — user: {name}")

            elif msg_type == "prompt":
                user_text = message.get("voicePrompt", "")
                session = SESSIONS.get(session_id)
                if not session:
                    continue

                transcript_lower = user_text.lower()
                session["transcript_parts"].append(f"{session['name']}: {user_text}")

                # --- Lonely keyword detection ---
                lonely_keywords = [
                    "lonely", "alone", "talk to someone",
                    "someone to talk to", "feeling lonely",
                ]
                if any(k in transcript_lower for k in lonely_keywords):
                    session["phase"] = "lonely_prompt"
                    await websocket.send_text(json.dumps({
                        "type": "text",
                        "token": (
                            "It sounds like you might enjoy speaking with someone. "
                            "I know another person who enjoys gardening too. "
                            "Would you like me to try connecting you? "
                            "Press 1 for yes, or press 2 to continue chatting with me."
                        ),
                        "last": True,
                    }))
                    continue

                # --- Exit keyword detection ---
                exit_keywords = [
                    "no thank you", "that's all", "nothing else",
                    "goodbye", "bye",
                ]
                if any(k in transcript_lower for k in exit_keywords):
                    riddle = await asyncio.to_thread(
                        ask_gemini,
                        "Give a short fun riddle suitable for an elderly person. Return only the riddle."
                    )
                    farewell = (
                        f"Alright, it was lovely chatting with you. "
                        f"Before I go, here's a little riddle. {riddle} "
                        f"Take care {session['first_name']}. I'll check in again soon."
                    )
                    session["transcript_parts"].append(f"AI: {farewell}")
                    _save_call_history(session, session["worst_risk"])

                    await websocket.send_text(json.dumps({
                        "type": "text",
                        "token": farewell,
                        "last": True,
                    }))
                    continue

                # --- Risk classification ---
                risk = await asyncio.to_thread(classify_risk, user_text)
                print(f"Transcript: {user_text}")
                print(f"Risk level: {risk}")

                risk_order = {"LOW_RISK": 0, "MEDIUM_RISK": 1, "HIGH_RISK": 2, "EMERGENCY": 3}
                if risk_order.get(risk, 0) > risk_order.get(session["worst_risk"], 0):
                    session["worst_risk"] = risk

                if risk in ["HIGH_RISK", "EMERGENCY"]:
                    try:
                        client.messages.create(
                            body=f"Hey Gran Alert: {session['name']} reported '{user_text}'",
                            from_=TWILIO_PHONE_NUMBER,
                            to=CAREGIVER_PHONE,
                        )
                    except Exception as e:
                        print(f"Failed to send SMS alert: {e}")

                # --- Generate AI response with full conversation context ---
                session["messages"].append({"role": "user", "content": user_text})
                ai_reply = await asyncio.to_thread(chat_completion, session["messages"])
                session["messages"].append({"role": "assistant", "content": ai_reply})
                session["transcript_parts"].append(f"AI: {ai_reply}")

                _save_call_history(session, risk)

                await websocket.send_text(json.dumps({
                    "type": "text",
                    "token": ai_reply,
                    "last": True,
                }))

            elif msg_type == "dtmf":
                digit = message.get("digit", "")
                session = SESSIONS.get(session_id)
                if not session:
                    continue

                if session.get("phase") == "lonely_prompt":
                    if digit == "1":
                        await websocket.send_text(json.dumps({
                            "type": "text",
                            "token": "Alright, let me see if they are available. Please hold for a moment.",
                            "last": True,
                        }))
                        await websocket.send_text(json.dumps({
                            "type": "end",
                            "handoffData": json.dumps({
                                "action": "connect_lonely",
                                "profile_id": session["profile_id"],
                                "caller": session["caller_phone"],
                            }),
                        }))
                    elif digit == "2":
                        session["phase"] = "normal"
                        await websocket.send_text(json.dumps({
                            "type": "text",
                            "token": "No problem at all. I'm happy to keep chatting with you.",
                            "last": True,
                        }))

            elif msg_type == "interrupt":
                print(f"Caller interrupted TTS playback for call {session_id}")

            elif msg_type == "error":
                print(f"ConversationRelay error for {session_id}: {message.get('description')}")

            else:
                print(f"Unknown ConversationRelay message type: {msg_type}")

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for call: {session_id}")
    except Exception as e:
        print(f"WebSocket error for call {session_id}: {e}")
    finally:
        session = SESSIONS.pop(session_id, None)
        if session and session.get("transcript_parts"):
            _save_call_history(session, session.get("worst_risk", "LOW_RISK"))


# ---------------------------------------------------------------------------
# Connect action — called when ConversationRelay session ends
# ---------------------------------------------------------------------------

@app.post("/connect-action")
def connect_action(
    HandoffData: str = Form(default=""),
    CallSid: str = Form(default=""),
):
    if HandoffData:
        try:
            data = json.loads(HandoffData)
        except (json.JSONDecodeError, TypeError):
            data = {}

        if data.get("action") == "connect_lonely":
            profile_id = data.get("profile_id", "")
            caller = data.get("caller", "")
            room_name = f"heygran-{uuid.uuid4().hex[:8]}"

            if not MATCH_USER_PHONE:
                twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy-Neural">I'm sorry, I couldn't find anyone available right now.</Say>
  <Hangup/>
</Response>"""
                return Response(content=twiml, media_type="application/xml")

            try:
                outbound = client.calls.create(
                    to=MATCH_USER_PHONE,
                    from_=TWILIO_PHONE_NUMBER,
                    url=f"{BASE_URL}/lonely-invite?caller={quote(caller)}&room={room_name}",
                )
                print(f"Outbound call to {MATCH_USER_PHONE}: SID={outbound.sid}")
            except Exception as e:
                print(f"Failed to call MATCH_USER_PHONE ({MATCH_USER_PHONE}): {e}")
                twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy-Neural">I'm sorry, I couldn't reach anyone right now.</Say>
  <Hangup/>
</Response>"""
                return Response(content=twiml, media_type="application/xml")

            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="45">
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true"
      waitUrl="http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical">{room_name}</Conference>
  </Dial>
  <Say voice="Polly.Amy-Neural">It looks like they weren't available this time. Take care!</Say>
  <Hangup/>
</Response>"""
            return Response(content=twiml, media_type="application/xml")

    twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# Lonely-user flow — outbound call handling (unchanged)
# ---------------------------------------------------------------------------

@app.post("/lonely-response")
def lonely_response(
    Digits: str = Form(...),
    room: str = Query(...),
):
    if Digits == "1":
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy-Neural">Connecting you now.</Say>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true">{room}</Conference>
  </Dial>
</Response>"""
    else:
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy-Neural">No problem. Have a lovely day.</Say>
</Response>"""

    return Response(content=twiml, media_type="application/xml")


@app.post("/lonely-invite")
def lonely_invite(caller: str = Query(...), room: str = Query(...)):
    profile = get_user_by_phone(caller) or {}
    name = profile.get("firstName", "Someone")
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
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
</Response>"""
    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# Call history
# ---------------------------------------------------------------------------

@app.get("/call-history")
def get_call_history():
    return MOCK_HISTORY
