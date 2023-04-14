from typing import Optional
from pydantic import EmailStr

from beanie import Document, Indexed

from core.config import get_settings


class UserDocument(Document):
    email: Indexed(EmailStr, unique=True)
    full_name: str
    role: Optional[str] = None
    hashed_password: str
    refresh_token: Optional[str] = None

    class Settings:
        name = get_settings().users_collection
