from typing import Optional
from pydantic import EmailStr

from models.schemas.mongo import MongoBase
from models.schemas.rwschema import RWSchema


class UserBase(RWSchema):
    email: EmailStr
    full_name: str
    role: Optional[str] = None


class UserInCreate(UserBase):
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "mammt@example.com",
                "password": "omae_wa_mo_shindeiru",
                "fullName": "Jason Bourne",
                "role": "Annotator",
            }
        }


class UserInUpdate(RWSchema):
    full_name: Optional[str]
    role: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "fullName": "Jason Bourne",
                "role": "Annotator",
            }
        }


class UserOutResponse(UserBase, MongoBase):
    class Config:
        schema_extra = {
            "example": {
                "email": "mammt@example.com",
                "fullName": "Jason Bourne",
                "role": "Annotator",
            }
        }
