import hashlib
import json

# simulate blockchain storage
proofs = set()


# -----------------------------
# Normalize Data (CRITICAL)
# -----------------------------
def normalize(data: dict) -> dict:
    """
    Ensure consistent structure for hashing
    - Remove None / empty values
    - Keep only relevant fields
    """
    return {
        "name": (data.get("name") or "").strip(),
        "category": (data.get("category") or "").strip(),
        "description": (data.get("description") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "event_date": (data.get("event_date") or "").strip(),
    }


# -----------------------------
# Generate Hash
# -----------------------------
def generate_hash(data: dict) -> str:
    normalized = normalize(data)

    return hashlib.sha256(
        json.dumps(normalized, sort_keys=True).encode()
    ).hexdigest()


# -----------------------------
# Store Proof
# -----------------------------
def store_proof(data: dict) -> str:
    hash_value = generate_hash(data)
    proofs.add(hash_value)
    return hash_value


# -----------------------------
# Verify Proof
# -----------------------------
def verify_proof(data: dict) -> bool:
    hash_value = generate_hash(data)
    return hash_value in proofs