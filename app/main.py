from fastapi import FastAPI
from fastapi import Form
from fastapi.responses import Response
from app.gemini import ask_gemini
from app.twilio_client import client
from app.config import TWILIO_PHONE_NUMBER, CAREGIVER_PHONE, BASE_URL

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

@app.post("/voice/start")
def voice_start():

    twiml = f"""
    <Response>
        <Gather input="speech" action="{BASE_URL}/voice/process" method="POST" speechTimeout="auto">
            <Say>Hello Mary, this is Hey Gran checking in.</Say>
            <Say>How are you feeling today?</Say>
        </Gather>

        <Say>Sorry, I didn't catch that.</Say>
        <Redirect method="POST">{BASE_URL}/voice/start</Redirect>
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

    twiml = f"""
<Response>
    <Say>{ai_reply}</Say>
    <Say>Thank you for chatting with me today.</Say>
    <Hangup/>
</Response>
"""

    return Response(content=twiml, media_type="application/xml")