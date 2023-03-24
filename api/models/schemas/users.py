from models.domain.users import UserBase


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


class UserOutResponse(UserBase):
    pass

    class Config:
        schema_extra = {
            "example": {
                "email": "mammt@example.com",
                "fullName": "Jason Bourne",
                "role": "Annotator",
            }
        }
