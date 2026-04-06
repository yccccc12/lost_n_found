from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from db.mongodb import users_collection
from passlib.context import CryptContext

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# --- Routes ---
router = APIRouter(prefix="/auth", tags=["User"])

class User(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: User):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        return {"error": "User already exists"}

    data = user.dict()
    data["password"] = hash_password(user.password)
    data["created_at"] = datetime.utcnow()

    result = users_collection.insert_one(data)

    return {"message": "User created", "user_id": str(result.inserted_id)}


@router.post("/login")
def login(user: User):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        return {"error": "User not found"}

    if not verify_password(user.password, db_user["password"]):
        return {"error": "Invalid password"}

    return {"message": "Login successful", "user_id": str(db_user["_id"])}