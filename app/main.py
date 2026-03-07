from fastapi import FastAPI
from fastapi import Form
from fastapi.responses import Response
from app.gemini import ask_gemini
from app.twilio_client import client
from app.config import TWILIO_PHONE_NUMBER, CAREGIVER_PHONE, BASE_URL
from app.users import USERS

app = FastAPI(title="Hey Gran Backend")

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

@app.get("/")
def root():
    return {"message": "Hey Gran backend running"}


@app.post("/call-user")
def call_user(phone: str):

    call = client.calls.create(
        to=phone,
        from_=TWILIO_PHONE_NUMBER,
        url=f"{BASE_URL}/voice/start"
    )

    return {"status": "calling", "call_sid": call.sid}

from app.users import USERS

@app.post("/voice/start")
def voice_start(From: str = Form(default="")):

    profile = USERS.get(From, {})

    name = profile.get("name", "there")
    conditions = profile.get("conditions", [])

    prompt = f"""
Create a friendly health check-in question for an elderly person.

Name: {name}
Conditions: {conditions}

Keep it short and warm.
"""

    question = ask_gemini(prompt)

    twiml = f"""
<Response>
<Gather input="speech" action="{BASE_URL}/voice/process" method="POST" speechTimeout="auto">
<Say>Hello {name}, this is Hey Gran checking in.</Say>
<Say>{question}</Say>
</Gather>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")


@app.post("/voice/process")
def voice_process(SpeechResult: str = Form(default=""), From: str = Form(default="")):

    transcript = SpeechResult

    risk = classify_risk(transcript)

    print("Transcript:", transcript)
    print("Risk level:", risk)

    # send caregiver alert if needed
    if risk in ["HIGH_RISK", "EMERGENCY"]:

        client.messages.create(
            body=f"Hey Gran Alert: {From} reported '{transcript}'",
            from_=TWILIO_PHONE_NUMBER,
            to=CAREGIVER_PHONE
        )

    response_prompt = f"""
You are a friendly AI companion speaking to an elderly person.

The user said: "{transcript}"

Respond kindly in one short sentence.
"""

    ai_reply = ask_gemini(response_prompt)

    riddle_prompt = """
Give a short fun riddle suitable for an elderly person.
Return only the riddle.
"""

    riddle = ask_gemini(riddle_prompt)

    twiml = f"""
<Response>
<Say>{ai_reply}</Say>
<Say>Before we go, here's a fun riddle.</Say>
<Say>{riddle}</Say>
<Say>Talk to you again soon.</Say>
<Hangup/>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")

@app.post("/caregiver/trigger-call")
def caregiver_trigger_call(user_phone: str):

    call = client.calls.create(
        to=user_phone,
        from_=TWILIO_PHONE_NUMBER,
        url=f"{BASE_URL}/voice/start"
    )

    return {
        "status": "call_started",
        "call_sid": call.sid
    }