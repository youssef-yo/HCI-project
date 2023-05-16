from datetime import datetime
from typing import Optional

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import PageRange, TaskDeltaAnnotations, TaskStatus


class TaskDocument(Document):
    user_id: Indexed(PydanticObjectId)
    doc_id: Indexed(PydanticObjectId)
    page_range: PageRange
    description: str = ""
    status: TaskStatus
    marked_complete: bool = False
    comments: str = ""
    created_at: datetime
    completed_at: Optional[datetime] = None
    commit: PydanticObjectId = None
    delta_annotations: TaskDeltaAnnotations = TaskDeltaAnnotations.empty()

    class Settings:
        name = get_settings().tasks_collection
