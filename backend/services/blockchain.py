import hashlib
import json
import time
from web3 import Web3
from config import settings

# -----------------------------
# Web3 Connection
# -----------------------------
RPC_URL = f"http://139.180.140.143/rpc/basic/{settings.DCAI_API_KEY}/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

PRIVATE_KEY = settings.WALLET_PRIVATE_KEY
ADDRESS = settings.WALLET_ADDRESS


# -----------------------------
# Normalize Data (CRITICAL)
# -----------------------------
def normalize(data: dict) -> dict:
    """
    Ensure consistent structure for hashing.
    - Remove None / empty values
    - Keep only relevant fields
    - Include initial_event and status
    - Include emails and action when present
    """
    out = {
        "name": (data.get("name") or "").strip(),
        "category": (data.get("category") or "").strip(),
        "description": (data.get("description") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "event_date": (data.get("event_date") or "").strip(),
    }
    
    # Include initial_event (how the item was reported: lost or found)
    initial_event = (data.get("initial_event") or "").strip()
    if initial_event:
        out["initial_event"] = initial_event
    
    # Include status (lost, found, or claimed)
    status = (data.get("status") or "").strip()
    if status:
        out["status"] = status
    
    # Include action if present (item_posted, item_claimed, etc.)
    action = (data.get("action") or "").strip()
    if action:
        out["action"] = action
    
    # Include reporter_email if present
    reporter_email = (data.get("reporter_email") or "").strip()
    if reporter_email:
        out["reporter_email"] = reporter_email
    
    # Include claimer_email if present
    claimer_email = (data.get("claimer_email") or "").strip()
    if claimer_email:
        out["claimer_email"] = claimer_email
    
    # Include report_tx_hash for claim transactions (forensic trail to original report)
    report_tx_hash = (data.get("report_tx_hash") or "").strip()
    if report_tx_hash:
        out["report_tx_hash"] = report_tx_hash
    
    return out


# -----------------------------
# Generate Hash
# -----------------------------
def generate_hash(data: dict) -> str:
    normalized = normalize(data)

    return hashlib.sha256(
        json.dumps(normalized, sort_keys=True).encode()
    ).hexdigest()


# -----------------------------
# Store Proof on Blockchain
# -----------------------------
def store_proof(data: dict) -> dict:
    """Store a SHA-256 proof hash on-chain via a self-transaction.

    Returns a dict with:
      - hash: the SHA-256 content hash
      - tx_hash: the on-chain transaction hash (0x-prefixed)
      - block_number: the block the tx was mined in
    """
    hash_value = generate_hash(data)

    nonce = w3.eth.get_transaction_count(ADDRESS)

    tx = {
        "nonce": nonce,
        "to": ADDRESS,
        "value": 0,
        "gas": 200000,
        "gasPrice": w3.to_wei("1", "gwei"),
        "data": w3.to_hex(text=hash_value),
        "chainId": 18441,
    }

    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # Wait until mined
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "hash": hash_value,
        "tx_hash": "0x" + tx_hash.hex(),
        "block_number": receipt.blockNumber,
    }


# -----------------------------
# Safe Transaction Fetch (Retry)
# -----------------------------
def get_transaction_with_retry(tx_hash_hex: str, retries=5, delay=2):
    for i in range(retries):
        try:
            return w3.eth.get_transaction(tx_hash_hex)
        except Exception:
            print(f"Retry {i+1}/{retries}...")
            time.sleep(delay)
    return None


# -----------------------------
# Verify Proof
# -----------------------------
def verify_proof(tx_hash_hex: str, data: dict) -> dict:
    """Verify that the on-chain data matches the expected hash for the given item data.

    Args:
        tx_hash_hex: The transaction hash (0x-prefixed) to look up on-chain.
        data: The item fields to re-hash and compare.

    Returns:
        A dict with 'valid' (bool) and hash details or error info.
    """
    tx = get_transaction_with_retry(tx_hash_hex)

    if not tx:
        return {
            "valid": False,
            "error": "Transaction not found after retries",
        }

    try:
        stored_hash = bytes(tx.input).decode()
        current_hash = generate_hash(data)

        return {
            "valid": stored_hash == current_hash,
            "stored_hash": stored_hash,
            "current_hash": current_hash,
        }

    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
        }