from fastapi import APIRouter, Request, HTTPException, Form
from starlette.datastructures import UploadFile
from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

from db.mongodb import items_collection
from services.s3 import upload_to_s3
from services.blockchain import store_proof, verify_proof

router = APIRouter(prefix="/items", tags=["Item"])


# -----------------------------
# Model
# -----------------------------
class Item(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[str] = None
    reporter_email: Optional[str] = Field(
        default=None,
        description="Creator/poster email (session).",
    )
    claimer_email: Optional[str] = Field(
        default=None,
        description="Email of user who claimed this item; set when status → claimed.",
    )
    initial_event: Literal["lost", "found"] = Field(
        ...,
        description="How item was reported (lost or found); never changes.",
    )
    status: Literal["lost", "found", "claimed"]
    image_urls: list[str] = []
    report_tx_hash: Optional[str] = None
    found_tx_hash: Optional[str] = None
    claim_tx_hash: Optional[str] = None

class MatchRequest(BaseModel):
    found_item_id: Optional[str] = None
    finder_email: Optional[str] = None

class ClaimRequest(BaseModel):
    claimer_email: str

def _form_optional_str(value: object | None) -> Optional[str]:
    if value is None:
        return None
    s = str(value).strip().lower()
    return s or None


# -----------------------------
# Create Item
# -----------------------------
# OpenAPI/Swagger: see main.py _patch_items_create_swagger_files (multipart + file pickers).
@router.post("/create")
async def create_item(
    request: Request,
    name: str = Form(..., description="Item title"),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    owner_email: Optional[str] = Form(
        None,
        description="Submitter email (e.g. from session); included in blockchain hash when set.",
    ),
    status: Literal["lost", "found"] = Form(..., description="Lost or found"),
):
    """Create an item. Text fields use Form(); files are read from the same multipart body.

    Swagger may send a text placeholder for empty file slots; those are ignored when uploading.
    """
    form = await request.form()

    urls: list[str] = []
    for key, value in form.multi_items():
        if key != "files":
            continue
        if not isinstance(value, UploadFile):
            continue
        filename = (value.filename or "").strip()
        if not filename:
            continue
        url = await upload_to_s3(value)
        urls.append(url)

    desc = _form_optional_str(description)
    loc = _form_optional_str(location)
    ev = _form_optional_str(event_date)
    session_email = _form_optional_str(owner_email)

    item = Item(
        name=name.strip(),
        category=category.strip(),
        description=desc,
        location=loc,
        event_date=ev,
        reporter_email=session_email,
        initial_event=status,  # How was it reported (lost or found)
        status=status,  # Initial lifecycle state matches how it was reported
        image_urls=urls,
    )

    data = item.dict()
    data["created_at"] = datetime.utcnow()

    hash_input = {
        "name": name.strip(),
        "category": category.strip(),
        "description": desc,
        "location": loc,
        "event_date": ev,
        "initial_event": status,
        "reporter_email": session_email,
        "action": "item_posted",
    }

    proof = store_proof(hash_input)
    data["report_tx_hash"] = proof["tx_hash"]
    
    result = items_collection.insert_one(data)

    return {
        "message": "Item created",
        "item_id": str(result.inserted_id),
        "image_urls": urls,
        "report_tx_hash": proof["tx_hash"],
        "created_at": data["created_at"].isoformat()
    }


# -----------------------------
# Get All Items
# -----------------------------
@router.get("/")
def get_items():
    items = []
    for item in items_collection.find({"is_redundant": {"$ne": True}}):
        item["_id"] = str(item["_id"])
        items.append(item)
    return items


# -----------------------------
# Pending claims for owner (lost → found, not yet claimed)
# -----------------------------
@router.get("/owner/pending-claims")
def get_pending_claims_for_owner(email: str):
    """
    Items the user originally REPORTED AS LOST that are now "found" (waiting to be claimed).
    This is the Bridge: Shows items in transition from Lost → Found → Claimed.
    Excludes items reported as found (those shouldn't show claim alerts to the founder).
    """
    reporter = _form_optional_str(email)
    if not reporter:
        return {"error": "Email is required"}

    items_out: list[dict] = []
    # Find LOST items reported by this user that are now status="found" (finder found them)
    for item in items_collection.find(
        {
            "reporter_email": reporter,
            "initial_event": "lost",  # Only lost items should trigger claim alerts
            "status": "found",  # Only show items that are in "found" state
            "is_redundant": {"$ne": True}
        }
    ).sort("found_at", -1):
        found_at = item.get("found_at")
        items_out.append(
            {
                "_id": str(item["_id"]),
                "name": item.get("name") or "—",
                "found_at": found_at.isoformat() if isinstance(found_at, datetime) else None,
            }
        )

    return {"items": items_out, "count": len(items_out)}


# -----------------------------
# Get Items by Status
# -----------------------------
@router.get("/{status}")
def get_items_by_status(status: Literal["lost", "found"]):
    """
    Filter items by their status: lost, found, or claimed.
    """
    items = []
    for item in items_collection.find({
        "status": status,
        "is_redundant": {"$ne": True}
    }):
        item["_id"] = str(item["_id"])
        items.append(item)
    return items


# -----------------------------
# Get Item by ID
# -----------------------------
@router.get("/detail/{item_id}")
def get_item(item_id: str) -> dict:
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
    item = items_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Build response with all fields explicitly to ensure proper serialization
    response = {
        "_id": str(item["_id"]),
        "name": item.get("name"),
        "category": item.get("category"),
        "description": item.get("description"),
        "location": item.get("location"),
        "event_date": item.get("event_date"),
        "created_at": item.get("created_at"),
        "initial_event": item.get("initial_event"),
        "status": item.get("status"),
        "reporter_email": item.get("reporter_email"),
        "claimer_email": item.get("claimer_email"),
        "finder_email": item.get("finder_email"),
        "image_urls": item.get("image_urls"),
        # Explicitly include all three hash fields
        "report_tx_hash": item.get("report_tx_hash"),
        "found_tx_hash": item.get("found_tx_hash"),
        "claim_tx_hash": item.get("claim_tx_hash"),
    }
    return response


# -----------------------------
# Match Found Item -> Lost Item
# -----------------------------
@router.post("/match/{lost_item_id}")
def match_item(lost_item_id: str, body: MatchRequest):
    """
    When a finder reports "I found this item", update the lost item's status to "found".
    This is the Bridge: Lost → Found state transition.
    """
    if not ObjectId.is_valid(lost_item_id):
        raise HTTPException(status_code=400, detail="Invalid lost item ID")

    lost_item = items_collection.find_one({"_id": ObjectId(lost_item_id)})
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    # Only items with status="lost" can transition to "found"
    if lost_item.get("status") != "lost":
        raise HTTPException(status_code=400, detail="Only items with status 'lost' can be marked as found")

    if body.finder_email and lost_item.get("reporter_email") == body.finder_email.lower().strip():
        raise HTTPException(status_code=400, detail="You cannot claim an item you reported as lost.")

    # Rebuild input for blockchain (record the transition)
    hash_input = {
        "name": lost_item.get("name"),
        "category": lost_item.get("category"),
        "description": lost_item.get("description"),
        "location": lost_item.get("location"),
        "event_date": lost_item.get("event_date"),
        "status": "found",  # Document the state transition
        "reporter_email": lost_item.get("reporter_email"),
        "finder_email": body.finder_email,
        "action": "item_found",
    }

    proof = store_proof(hash_input)

    # UPDATE STATUS FROM LOST → FOUND
    items_collection.update_one(
        {"_id": ObjectId(lost_item_id)},
        {"$set": {
            "status": "found",  # ← Critical: state transition
            "finder_email": body.finder_email,
            "found_at": datetime.utcnow(),
            "found_tx_hash": proof["tx_hash"]
        }}
    )

    # Optionally hide redundant found item from the public list
    if body.found_item_id and ObjectId.is_valid(body.found_item_id):
        items_collection.update_one(
            {"_id": ObjectId(body.found_item_id)},
            {"$set": {"is_redundant": True}}
        )

    return {"message": "Item marked as found on blockchain", "tx_hash": proof["tx_hash"]}


# -----------------------------
# Claim Found Item
# -----------------------------
@router.put("/claim/{item_id}")
def claim_item(item_id: str, body: ClaimRequest):
    """
    Claim endpoint: User claims an item (lost or found).
    Updates status to 'claimed' and records on blockchain with both emails.
    Once claimed, the record is permanently locked.
    """
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")

    item = items_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Only items in found status can be claimed (not already claimed)
    current_status = item.get("status")
    if current_status == "claimed":
        raise HTTPException(status_code=400, detail="This item is already claimed.")
    if current_status != "found":
        raise HTTPException(status_code=400, detail="Only items marked as found can be claimed.")

    # Normalize the claimer email
    claimer_email = body.claimer_email.lower().strip() if body.claimer_email else None
    if not claimer_email:
        raise HTTPException(status_code=400, detail="Claimer email is required.")

    reporter_email = item.get("reporter_email")
    finder_email = item.get("finder_email")
    initial_event = item.get("initial_event")
    
    # Authorization logic:
    # - If initial_event="found": Founder (reporter) CANNOT claim their own found item
    # - If initial_event="lost": Finder CANNOT claim the item they found
    if initial_event == "found" and reporter_email:
        if claimer_email == reporter_email.lower().strip():
            raise HTTPException(status_code=400, detail="You cannot claim an item you reported as found.")
    elif initial_event == "lost" and finder_email:
        if claimer_email == finder_email.lower().strip():
            raise HTTPException(status_code=400, detail="You cannot claim an item you found.")

    report_tx_hash = item.get("report_tx_hash")

    # Create blockchain payload for claim
    hash_input = {
        "action": "item_claimed",
        "reporter_email": reporter_email,
        "claimer_email": claimer_email,
        "report_tx_hash": report_tx_hash,
        "name": item.get("name"),
        "category": item.get("category"),
        "status": current_status,
        "claimed_at": datetime.utcnow().isoformat(),
    }

    # Submit to blockchain and get receipt
    proof = store_proof(hash_input)

    # Update MongoDB - set to claimed and record claim tx hash
    items_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {
            "status": "claimed",
            "claimer_email": claimer_email,
            "claimed_at": datetime.utcnow(),
            "claim_tx_hash": proof["tx_hash"],
            "locked": True
        }}
    )

    return {
        "message": "Item successfully claimed.",
        "claim_tx_hash": proof["tx_hash"],
        "reporter_email": reporter_email,
        "claimer_email": claimer_email,
        "status": "claimed"
    }


# -----------------------------
# Update Item
# -----------------------------
@router.put("/{item_id}")
def update_item(item_id: str, item: Item):
    data = item.dict()
    data["updated_at"] = datetime.utcnow()

    result = items_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": data}
    )

    if result.matched_count == 0:
        return {"error": "Item not found"}

    return {"message": "Item updated"}


# -----------------------------
# Delete Item
# -----------------------------
@router.delete("/{item_id}")
def delete_item(item_id: str):
    result = items_collection.delete_one(
        {"_id": ObjectId(item_id)} 
    )

    if result.deleted_count == 0:
        return {"error": "Item not found"}

    return {"message": "Item deleted"}

# -----------------------------
# Verify Item Blockchain Hash
# -----------------------------
@router.post("/verify/{item_id}")
def verify_item(item_id: str):
    item = items_collection.find_one({"_id": ObjectId(item_id)})

    if not item:
        return {"error": "Item not found"}

    tx_hash = item.get("tx_hash")
    if not tx_hash:
        return {"error": "No blockchain transaction found for this item"}

    # rebuild EXACT same hash input for verification
    hash_input = {
        "action": "item_claimed",
        "reporter_email": item.get("reporter_email"),
        "claimer_email": item.get("claimer_email"),
        "original_tx_hash": item.get("tx_hash"),
        "name": item.get("name"),
        "category": item.get("category"),
    }

    closing_tx_hash = item.get("closing_tx_hash")
    result = verify_proof(closing_tx_hash, hash_input)

    return result