import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB
    MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
    MONGODB_URL = os.getenv("MONGODB_URL")
    
    # AWS
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION")
    AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

    # AI
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # Blockchain
    DCAI_API_KEY=os.getenv("DCAI_API_KEY")
    WALLET_ADDRESS=os.getenv("WALLET_ADDRESS")
    WALLET_PRIVATE_KEY=os.getenv("WALLET_PRIVATE_KEY")

settings = Settings()