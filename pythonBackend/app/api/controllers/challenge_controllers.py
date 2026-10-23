from fastapi import HTTPException

CHALLENGES = [
    {
        "id": 1,
        "name": "Tiny but Mighty",
        "description": "Build a CNN under 4 blocks with ≥80% accuracy.",
        "target_accuracy": 80.0,
        "max_blocks": 4,
        "dataset": "CIFAR10"
    },
    {
        "id": 2,
        "name": "No Conv Allowed",
        "description": "Reach 70% accuracy without using Conv2D.",
        "target_accuracy": 70.0,
        "disallowed_blocks": ["ConvBlock"],
        "dataset": "MNIST"
    }
]

# Sessions = {}

def get_all_challenges():
    return CHALLENGES

def start_challenge(user_id: str, challenge_id: int):
    challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # new_session = {
    #     "user_id": user_id,
    #     "challenge_id": challenge_id,
    #     "status": "in_progress",
    #     "tower": None,
    #     "result": None
    # }
    # Sessions[user_id] = new_session
    return {"message": "Challenge started", "challenge": challenge}
