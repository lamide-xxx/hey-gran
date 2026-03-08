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
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuATTwb0LCUQw4Xk8zsBSrX2XNBnGHzl8SIaS_0CaxxTLyH4yjnJE9X99CiTGQ85QvXW7gf_5Zgfy0Rh2VxbGa5fUrl7a4KHoOSuMyKzYAQpzQTKlsrIVBgtWUkE4vUtjH6ESqh4ac0uRYQqnHNIdxPCvFJoiWbnqiYzVgKGAKUMw75qhHSOZ8pxomOo-HHHBt5tWPyow8HU0a9upvtPZsTV7p3V5IjxiMYMQcyjNyOA2wFVi7-tSG0lJW8PPZgQfqe-1gw9-A7W180",
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
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBjyJfvwQGcu1ey9i9yuDB_p_vQlkIQgCgbPJT4bVJNmrQLsuOKjS3YW0Y_TUao2FQRzc0G3Nsc1AuxbsY_ouOKRqvoPFZyihgI1mXNlnfuy8g3ODaufbudGL7eUgKd-1SBYj1Ujn7E9NkbFfUnoRcP6yPUyJVmBujmB-QJ_Yq5ToBbLHe6V-AdZLNERfCH8OBqT35-jbpM8mFFl8BV5x0geLo6sc1IORvanbbqEmE3ghhVRJ-8vYJp8evXqcu_eSaVFsuyT6z54so",
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