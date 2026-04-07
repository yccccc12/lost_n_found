from web3 import Web3
import hashlib
import json
import time
import os
from config import settings

# -----------------------------
# CONFIG
# -----------------------------
RPC_URL = f"http://139.180.140.143/rpc/basic/{settings.DCAI_API_KEY}/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

PRIVATE_KEY = settings.WALLET_PRIVATE_KEY
ADDRESS = settings.WALLET_ADDRESS


# -----------------------------
# NORMALIZE DATA
# -----------------------------
def normalize(data: dict) -> dict:
    return {
        "name": (data.get("name") or "").strip(),
        "category": (data.get("category") or "").strip(),
        "description": (data.get("description") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "event_date": (data.get("event_date") or "").strip(),
    }


# -----------------------------
# GENERATE HASH
# -----------------------------
def generate_hash(data: dict) -> str:
    normalized = normalize(data)
    return hashlib.sha256(
        json.dumps(normalized, sort_keys=True).encode()
    ).hexdigest()


# -----------------------------
# STORE ON BLOCKCHAIN (FIXED)
# -----------------------------
def store_on_chain(data: dict):
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

    print("⏳ Waiting for blockchain confirmation...")

    # ✅ WAIT UNTIL MINED
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "hash": hash_value,
        "tx_hash": "0x" + tx_hash.hex(),
        "block_number": receipt.blockNumber
    }


# -----------------------------
# SAFE TRANSACTION FETCH (RETRY)
# -----------------------------
def get_transaction_with_retry(tx_hash, retries=5, delay=2):
    for i in range(retries):
        try:
            return w3.eth.get_transaction(tx_hash)
        except Exception:
            print(f"Retry {i+1}/{retries}...")
            time.sleep(delay)
    return None


# -----------------------------
# VERIFY PROOF
# -----------------------------
def verify_proof(tx_hash: str, data: dict):
    tx = get_transaction_with_retry(tx_hash)

    if not tx:
        return {
            "valid": False,
            "error": "Transaction not found after retries"
        }

    try:
        stored_hash = bytes(tx.input).decode()
        current_hash = generate_hash(data)

        return {
            "valid": stored_hash == current_hash,
            "stored_hash": stored_hash,
            "current_hash": current_hash
        }

    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


# -----------------------------
# MOCK DATA
# -----------------------------
mock_item = {
    "name": "Black Iphone 17 Pro",
    "category": "Personal Item",
    "description": "Black Iphone 17 Pro with cracked screen",
    "location": "Library Level 2",
    "event_date": "2026-04-06"
}


# -----------------------------
# MAIN TEST FLOW
# -----------------------------
if __name__ == "__main__":
    print("🔗 Connected:", w3.is_connected())

    # 1. Store on blockchain
    result = store_on_chain(mock_item)

    print("\n=== STORED ON BLOCKCHAIN ===")
    print("Hash:", result["hash"])
    print("TX:", result["tx_hash"])
    print("Block:", result["block_number"])

    # 2. Verify proof
    verification = verify_proof(result["tx_hash"], mock_item)

    print("\n=== VERIFICATION RESULT ===")
    print(verification)

    # 3. Explorer link
    print("\n🔍 View on Explorer:")
    print(f"http://139.180.140.143/tx/{result['tx_hash']}")