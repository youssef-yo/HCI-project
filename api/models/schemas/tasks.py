from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr

from models.schemas.mongo import MongoBase, PydanticObjectId
from models.schemas.rwschema import RWSchema


class TaskStatus(str, Enum):
    active = "ACTIVE"
    committed = "COMMITTED"
    dismissed = "DISMISSED"


class PageRange(BaseModel):
    start: int
    end: int

    def overlaps(self, other: "PageRange") -> bool:
        """
        Checks whether the current page range overlaps with another given page range.
        Both start and end pages are considered inclusive.
        """
        # TODO: Move this logic into a "app" component.

        if self.start >= other.start and self.start <= other.end:
            return True
        if self.end >= other.start and self.end <= other.end:
            return True

        if other.start >= self.start and other.start <= self.end:
            return True
        if other.end >= self.start and other.end <= self.end:
            return True

        return False
    
    def is_within(self, page: int) -> bool:
        """
        Checks if the page number is within the range.
        """
        return page >= self.start and page <= self.end


class TaskBase(RWSchema):
    user_id: PydanticObjectId
    doc_id: PydanticObjectId
    page_range: PageRange
    description: str


class TaskInCreate(TaskBase):
    pass


class TaskOutResponse(TaskBase, MongoBase):
    status: TaskStatus
    marked_complete: bool
    comments: str
    completed_at: Optional[datetime]


class TaskDocument(MongoBase):
    name: str
    total_pages: str


class TaskAnnotator(MongoBase):
    email: EmailStr
    full_name: str


class TaskExtended(MongoBase):
    document: Optional[TaskDocument]
    annotator: Optional[TaskAnnotator]
    page_range: PageRange
    description: str
    status: TaskStatus
    marked_complete: bool


class TaskExtendedOutResponse(RWSchema, TaskExtended):
    pass
