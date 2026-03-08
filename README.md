# Hey Gran!

AI-powered wellness check-in calls for elderly loved ones.

[Watch the Demo](https://youtu.be/9kDLC-qpjv0)

## Features

- **AI Voice Check-Ins** — Automated phone calls with a warm, natural-sounding AI voice that chats with elderly users about their day
- **Sentiment & Risk Detection** — Every response is classified in real time (Low / Medium / High / Emergency) using a cautious risk classifier
- **Caregiver SMS Alerts** — If anything concerning is detected, an SMS is instantly sent to the caregiver via Twilio
- **Loneliness Detection** — The AI picks up on loneliness cues and offers to connect the user with a companion
- **Real-Time User Connection** — Lonely users are bridged together via Twilio Conference with hold music while the other party is called
- **Caregiver Dashboard** — A clean web dashboard to manage loved ones, trigger calls, and view call history with transcripts

## Architecture

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Frontend   │         │     Backend      │         │   Twilio     │
│  (Next.js)   │◄───────►│   (FastAPI)      │◄───────►│   Voice +    │
│   Vercel     │  REST   │    Render        │  TwiML  │   SMS        │
└──────────────┘         └────────┬─────────┘         └──────┬───────┘
                                  │                          │
                                  │ WebSocket                │ ConversationRelay
                                  │                          │
                         ┌────────▼─────────┐         ┌──────▼───────┐
                         │    OpenAI        │         │  ElevenLabs  │
                         │  GPT-4o-mini    │         │    TTS       │
                         │                  │         │  (via Twilio)│
                         │ - Conversation   │         └──────────────┘
                         │ - Risk classify  │
                         │ - Riddle gen     │
                         └──────────────────┘
```

### Call Flow

```
1. Caregiver triggers call from dashboard
2. Twilio calls the elderly user's phone
3. ConversationRelay opens a WebSocket to our server
4. User speaks → Twilio transcribes (STT) → sends to backend
5. Backend sends transcript to OpenAI for a conversational response
6. Backend also classifies risk level via a separate OpenAI call
7. Response text is sent back over WebSocket → Twilio converts to speech (ElevenLabs TTS)
8. If HIGH_RISK or EMERGENCY → SMS alert sent to caregiver via Twilio
9. If loneliness detected → offer to connect with another user via Twilio Conference
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, Tailwind CSS |
| Backend | Python, FastAPI |
| AI / LLM | OpenAI GPT-4o-mini |
| Voice | Twilio ConversationRelay, ElevenLabs TTS |
| SMS Alerts | Twilio Programmable Messaging |
| Hosting | Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Twilio account with ConversationRelay enabled
- OpenAI API key
- ngrok or Cloudflare Tunnel (for local development)

### Backend

```bash
cd hey-gran
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your environment variables in .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
CAREGIVER_PHONE=
OPENAI_API_KEY=
BASE_URL=
MATCH_USER_PHONE=
```

## Team

Built at a hackathon with care for the people who raised us.
