import os
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

CAREGIVER_PHONE = os.getenv("CAREGIVER_PHONE")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

BASE_URL = os.getenv("BASE_URL")