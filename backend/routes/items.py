from fastapi import APIRouter, Request, HTTPException, Form
from starlette.datastructures import UploadFile
from typing import Optional, Literal
from pydantic import BaseModel
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
    contact_email: Optional[str] = None
    status: Literal["lost", "found"]
    image_urls: list[str] = []
    is_resolved: bool = False


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
    em = _form_optional_str(contact_email)

    item = Item(
        name=name.strip(),
        category=category.strip(),
        description=desc,
        location=loc,
        event_date=ev,
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