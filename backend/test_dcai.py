from services.blockchain import store_proof, verify_proof, w3


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
    print("⏳ Waiting for blockchain confirmation...")
    result = store_proof(mock_item)

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