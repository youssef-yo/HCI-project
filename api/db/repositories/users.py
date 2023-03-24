from typing import List, Optional

from pymongo import MongoClient
from pymongo.collection import Collection

from core.config import configuration

from models.domain.users import UserInDB


class UserRepository():
    def __init__(self, client: MongoClient) -> None:
        self._client: MongoClient = client
        self._collection: Collection = client[configuration.database_name][configuration.users_collection]

    def create(self, user: UserInDB) -> Optional[UserInDB]:
        result = self._collection.insert_one(user.dict())
        if not result.acknowledged:
            return None

        created_user = self._collection.find_one({"_id": result.inserted_id})
        return UserInDB(**created_user)
    
    def update(self, user: UserInDB) -> None:
        self._collection.update_one(
            {"email": user.email},
            {"$set": user.dict()}
        )

    def find_all(self) -> List[UserInDB]:
        users = self._collection.find({})
        return [UserInDB(**user) for user in users] if users else []

    def find_by_email(self, email: str) -> Optional[UserInDB]:
        user = self._collection.find_one({"email": email})
        return UserInDB(**user) if user else None
    
    def find_by_refresh_token(self, token: str) -> Optional[UserInDB]:
        user = self._collection.find_one({"refresh_token": token})
        return UserInDB(**user) if user else None
    
    @property
    def client(self):
        return self._client
    
    @property
    def collection(self):
        return self._collection
