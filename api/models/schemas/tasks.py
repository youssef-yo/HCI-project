from datetime import datetime
from typing import Optional

from models.schemas.mongo import MongoBase, PydanticObjectId
from models.schemas.rwschema import RWSchema


class PageRange(RWSchema):
    start: int
    end: int


class TaskBase(RWSchema):
    user_id: PydanticObjectId
    doc_id: PydanticObjectId
    page_range: PageRange


class TaskInCreate(TaskBase):
    pass


class TaskOutResponse(TaskBase, MongoBase):
    finished: bool
    junk: bool
    comments: str
    completed_at: Optional[datetime]

