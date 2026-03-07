from fastapi import FastAPI
from fastapi.responses import Response
from app.twilio_client import client
from app.config import TWILIO_PHONE_NUMBER, BASE_URL

app = FastAPI(title="Hey Gran Backend")


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

    twiml = """
    <Response>
        <Say>Hello Mary, this is Hey Gran checking in.</Say>
        <Say>How are you feeling today?</Say>
    </Response>
    """

    return Response(content=twiml, media_type="application/xml")