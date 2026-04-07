from fastapi import APIRouter, UploadFile, File, Form
from typing import Annotated, Optional, Literal
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from db.mongodb import items_collection
from services.s3 import upload_to_s3
from services.blockchain import store_proof, verify_proof

from bson import ObjectId

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
    contact_email: Optional[str] = None
    status: Literal["lost", "found"]
    image_urls: list[str] = []
    is_resolved: bool = False


# -----------------------------
# Create Item
# -----------------------------
@router.post("/create")
async def create_item(
    name: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    status: Literal["lost", "found"] = Form(...),
    files: Annotated[
        list[UploadFile] | None,
        File(
            description="Optional. Choose one or more image files (multipart file upload, not raw text).",
        ),
    ] = None,
):
    urls = []

    for file in files or []:
        if file is None:
            continue
        filename = getattr(file, "filename", None) or ""
        if not filename.strip():
            continue
        url = await upload_to_s3(file)
        urls.append(url)

    item = Item(
        name=name,
        category=category,
        description=description,
        location=location,
        event_date=event_date,
        contact_email=contact_email,
        status=status,
        image_urls=urls,
    )

    data = item.dict()
    data["created_at"] = datetime.utcnow()

    hash_input = {
        "name": name,
        "category": category,
        "description": description,
        "location": location,
        "event_date": event_date,
    }

    proof_hash = store_proof(hash_input)
    data["blockchain_hash"] = proof_hash
    data["hash_input"] = hash_input
    
    result = items_collection.insert_one(data)

    return {
        "message": "Item created",
        "item_id": str(result.inserted_id),
        "image_urls": urls,
        "blockchain_hash": proof_hash,
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

    # rebuild EXACT same hash input
    hash_input = {
        "name": item.get("name"),
        "category": item.get("category"),
        "description": item.get("description"),
        "location": item.get("location"),
        "event_date": item.get("event_date"),
    }

    is_valid = verify_proof(hash_input)

    return {"valid": is_valid}