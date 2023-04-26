from datetime import datetime

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import PdfAnnotation


class TaskDocument(Document):
    user_id: Indexed(PydanticObjectId)
    doc_id: Indexed(PydanticObjectId)
    finished: bool = False
    junk: bool = False
    comments: str = ""
    completed_at: datetime
    doc_annotations: PdfAnnotation

    class Settings:
        name = get_settings().tasks_collection
