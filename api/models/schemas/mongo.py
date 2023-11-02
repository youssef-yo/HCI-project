from bson import ObjectId

from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class MongoBase(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
