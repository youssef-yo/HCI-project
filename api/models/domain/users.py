from typing import Optional
from pydantic import EmailStr

from models.domain.rwmodel import RWModel

from services import security


class UserBase(RWModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = None


class UserInDB(UserBase):
    hashed_password: str
    refresh_token: Optional[str] = None

    def check_password(self, password: str) -> bool:
        return security.verify_password(password, self.hashed_password)
