from datetime import datetime
from typing import Optional

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import PageRange, PdfAnnotation, TaskStatus


class TaskDocument(Document):
    user_id: Indexed(PydanticObjectId)
    doc_id: Indexed(PydanticObjectId)
    page_range: PageRange
    description: str = ""
    status: TaskStatus
    marked_complete: bool = False
    comments: str = ""
    completed_at: Optional[datetime] = None
    doc_annotations: PdfAnnotation = PdfAnnotation.empty()

    class Settings:
        name = get_settings().tasks_collection
