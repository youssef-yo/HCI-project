from typing import Optional

from pymongo import MongoClient

from db.repositories.users import UserRepository


class Database():
    client: Optional[MongoClient] = None


db = Database()


def get_database() -> MongoClient:
    return db.client

def get_users_repo() -> UserRepository:
    return UserRepository(get_database())
