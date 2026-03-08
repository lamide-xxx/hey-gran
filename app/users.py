# Single source of truth for all users / loved-one profiles.
# Keyed by slug (e.g. "dorothy") so routes and the frontend can reference them easily.
# The `phone` field is the editable UK mobile number used to trigger Twilio calls.
# The `caregiver` field is the number that receives high-risk SMS alerts.

USERS = {
    "dorothy": {
        "id": "dorothy",
        "name": "Dorothy Johnson",
        "firstName": "Dorothy",
        "age": "82 years old",
        "ageNumber": 82,
        "relation": "Mother",
        "phone": "",
        "caregiver": "+447700000099",
        "status": "Stable",
        "statusColor": "emerald",
        "image": "/images/dorothy.jpg",
        "conditions": [
            {"name": "Type 2 Diabetes", "detail": "Diagnosed 2018"},
            {"name": "Hypertension", "detail": "Regular monitoring required"},
        ],
        "interests": ["Gardening", "Coronation Street", "Chatty"],
        "meds": [
            {"name": "Amlodipine", "detail": "5mg \u2022 Morning"},
            {"name": "Metformin", "detail": "500mg \u2022 Twice daily"},
        ],
        "recent_issue": None,
    },
    "arthur": {
        "id": "arthur",
        "name": "Uncle Arthur",
        "firstName": "Arthur",
        "age": "75 years old",
        "ageNumber": 75,
        "relation": "Uncle",
        "phone": "",
        "caregiver": "+447700000099",
        "status": "Resting",
        "statusColor": "amber",
        "image": "/images/arthur.jpg",
        "conditions": [
            {"name": "Arthritis", "detail": "Knees and hands"},
        ],
        "interests": ["Football (Arsenal)", "History Books", "Quiet"],
        "meds": [
            {"name": "Ibuprofen", "detail": "As needed for pain"},
        ],
        "recent_issue": None,
    },
}


def get_user_by_phone(phone: str) -> dict:
    """Look up a user by their phone number — used by Twilio voice webhooks."""
    for user in USERS.values():
        if user.get("phone") == phone:
            return user
    return {}