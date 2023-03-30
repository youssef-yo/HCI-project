from typing import Optional
from pydantic import EmailStr

from beanie import Document

from core.config import settings

from models.domain.rwmodel import RWModel


class UserBase(RWModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = None


class UserDocument(Document):
    email: EmailStr
    full_name: str
    role: Optional[str] = None
    hashed_password: str
    refresh_token: Optional[str] = None

    class Settings:
        name = settings.users_collection
