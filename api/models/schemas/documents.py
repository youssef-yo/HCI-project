from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel

from models.schemas.mongo import MongoBase, PydanticObjectId
from models.schemas.rwschema import RWSchema


class Box(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Token(Box):
    text: str


class Block(Box):
    label: str


class PageInfo(BaseModel):
    width: float
    height: float
    index: int


class Page(BaseModel):
    page: PageInfo
    tokens: List[Union[Token, Block]]


class DocumentBase(RWSchema):
    name: str
    total_pages: int


class DocumentOutResponse(DocumentBase, MongoBase):
    class Config:
        schema_extra = {
            "example": {
                "name": "T-LCM_Pedals_User_Manual_Eng_Compressed",
                "totalPages": 16
            }
        }


class DocCommitBase(RWSchema):
    doc_id: PydanticObjectId
    created_at: datetime
    prev_commit: Optional[PydanticObjectId]


class DocCommitOutResponse(DocCommitBase, MongoBase):
    pass
