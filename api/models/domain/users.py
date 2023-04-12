from typing import Optional
from pydantic import EmailStr

from beanie import Document

from core.config import get_settings


class UserDocument(Document):
    email: EmailStr
    full_name: str
    role: Optional[str] = None
    hashed_password: str
    refresh_token: Optional[str] = None

    class Settings:
        name = get_settings().users_collection
