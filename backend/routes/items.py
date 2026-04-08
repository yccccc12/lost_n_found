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
    email: Optional[str] = Field(
        default=None,
        description="Submitter email (session); included in blockchain hash when set.",
    )
    contact_email: Optional[str] = None
    status: Literal["lost", "found", "claimed"]
    image_urls: list[str] = []

def _form_optional_str(value: object | None) -> Optional[str]:
    if value is None:
        return None
    s = str(value).strip()
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
    email: Optional[str] = Form(
        None,
        description="Submitter email (e.g. from session); included in blockchain hash when set.",
    ),
    contact_email: Optional[str] = Form(None),
    status: Literal["lost", "found"] = Form(..., description="Lost or found"),
):
    """Create an item. Text fields use Form(); files are read from the same multipart body.

    Swagger may send a text placeholder for empty file slots; those are ignored when uploading.
    """
    status_val = status

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
    session_email = _form_optional_str(email)
    em = _form_optional_str(contact_email)

    item = Item(
        name=name.strip(),
        category=category.strip(),
        description=desc,
        location=loc,
        event_date=ev,
        email=session_email,
        contact_email=em,
        status=status_val,
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
        "email": session_email,
    }

    proof = store_proof(hash_input)
    data["blockchain_hash"] = proof["hash"]
    data["tx_hash"] = proof["tx_hash"]
    data["block_number"] = proof["block_number"]
    data["hash_input"] = hash_input
    
    result = items_collection.insert_one(data)

    return {
        "message": "Item created",
        "item_id": str(result.inserted_id),
        "image_urls": urls,
        "blockchain_hash": proof["hash"],
        "tx_hash": proof["tx_hash"],
        "block_number": proof["block_number"],
        "created_at": data["created_at"].isoformat()
    }


# -----------------------------
# Get All Items
# -----------------------------
@router.get("/")
def get_items():
    items = []
    for item in items_collection.find():
        item["_id"] = str(item["_id"])
        items.append(item)
    return items


# -----------------------------
# Get Items by Status
# -----------------------------
@router.get("/{status}")
def get_items_by_status(status: Literal["lost", "found"]):
    items = []
    for item in items_collection.find({"status": status}):
        item["_id"] = str(item["_id"])
        items.append(item)
    return items


# -----------------------------
# Get Item by ID
# -----------------------------
@router.get("/detail/{item_id}")
def get_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
    item = items_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item["_id"] = str(item["_id"])
    return item


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

    # rebuild EXACT same hash input (email omitted in chain when null — see blockchain.normalize)
    hash_input = {
        "name": item.get("name"),
        "category": item.get("category"),
        "description": item.get("description"),
        "location": item.get("location"),
        "event_date": item.get("event_date"),
        "email": item.get("email"),
    }

    result = verify_proof(tx_hash, hash_input)

    return result