from datetime import datetime
from typing import Optional

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import PdfAnnotation


class DocCommitDocument(Document):
    doc_id: Indexed(PydanticObjectId)
    created_at: datetime
    doc_annotations: PdfAnnotation

    class Settings:
        name = get_settings().doc_commits_collection
