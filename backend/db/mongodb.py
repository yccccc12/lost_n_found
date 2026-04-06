from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config import settings

uri = settings.MONGODB_URL
client = MongoClient(uri, server_api=ServerApi('1'))

db = client['nottshack']

users_collection = db['users']
items_collection = db['items']