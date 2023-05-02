import json
import os
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    status
)
from fastapi.responses import Response
from fastapi.encoders import jsonable_encoder

from db.database import MongoClient, get_db

from models.schemas import (
    Annotation,
    DocumentOutResponse,
    Page,
    PdfAnnotation,
    PydanticObjectId,
    RelationGroup,
    TaskOutResponse
)
from models.domain import (
    DocStructureDocument,
    DocumentDocument,
    TaskDocument,
    UserDocument
)

from services.doc import (
    get_document_by_id,
    get_document_structure
)
from services.oauth2 import get_current_user

from core.config import Settings, get_settings


router = APIRouter()


@router.get("", response_model=List[DocumentOutResponse])
async def get_all_documents():
    docs = await DocumentDocument.find({}).to_list()
    return docs


@router.get("/{sha}", response_model=DocumentOutResponse)
async def get_document(
    sha: PydanticObjectId
):
    doc = await get_document_by_id(sha, assert_exists=True)
    return doc


@router.get("/{sha}/pdf", response_class=Response)
async def get_pdf(
    sha: PydanticObjectId,
    db: MongoClient = Depends(get_db)
):
    """
    Fetches the PDF file that belongs to a document.
    """
    pdf = await get_document_by_id(sha, assert_exists=True)

    # Retrieve the document file from GridFS
    grid_out = await db.gridFS.open_download_stream(pdf.file_id)
    file = await grid_out.read()

    return Response(file, media_type="application/pdf")


@router.get("/{sha}/annotations")
def get_annotations(
    sha: str,
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
) -> PdfAnnotation:
    annotations = os.path.join(
        settings.output_directory, sha, f"{user.email}_annotations.json"
    )
    exists = os.path.exists(annotations)

    if exists:
        with open(annotations) as f:
            blob = json.load(f)

        return blob

    else:
        return {"annotations": [], "relations": []}


@router.post("/{sha}/annotations")
def save_annotations(
    sha: str,
    annotations: List[Annotation],
    relations: List[RelationGroup],
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    """
    sha: str
        PDF sha to save annotations for.
    annotations: List[Annotation]
        A json blob of the annotations to save.
    relations: List[RelationGroup]
        A json blob of the relations between the annotations to save.
    x_auth_request_email: str
        This is a header sent with the requests which specifies the user login.
        For local development, this will be None, because the authentication
        is controlled by the Skiff Kubernetes cluster.
    """
    # Update the annotations in the annotation json file.
    annotations_path = os.path.join(
        settings.output_directory, sha, f"{user.email}_annotations.json"
    )
    json_annotations = [jsonable_encoder(a) for a in annotations]
    json_relations = [jsonable_encoder(r) for r in relations]

    # Update the annotation counts in the status file.
    status_path = os.path.join(settings.output_directory, "status", f"{user.email}.json")
    exists = os.path.exists(status_path)
    if not exists:
        # Not an allocated user. Do nothing.
        return {}

    with open(annotations_path, "w+") as f:
        json.dump({"annotations": json_annotations, "relations": json_relations}, f)

    update_status_json(
        status_path, sha, {"annotations": len(annotations), "relations": len(relations)}
    )

    return {}


@router.get("/{sha}/tasks", response_model=List[TaskOutResponse])
async def get_document_tasks(
    sha: PydanticObjectId,
    user: UserDocument = Depends(get_current_user)
):
    doc = await get_document_by_id(sha, assert_exists=True)
    
    tasks = await TaskDocument.find_many(TaskDocument.doc_id == sha).to_list()
    return tasks


@router.get("/{sha}/tasks/{task_id}/annotations")
async def get_document_annotations_by_task(
    sha: PydanticObjectId,
    task_id: PydanticObjectId,
    user: UserDocument = Depends(get_current_user)
):
    """
    Retrieves the annotations for the specified document, taking in consideration
    the modifications that have happened with the specified task.
    """
    pass


@router.get("/{sha}/tokens", response_model=List[Page])
async def get_tokens(
    sha: PydanticObjectId,
    db: MongoClient = Depends(get_db)
):
    """
    Gets the PDF structure (pages and tokens) of the file belonging to a document.
    """
    doc_structure = await get_document_structure(sha)
    return doc_structure.structure


def update_status_json(status_path: str, sha: str, data: Dict[str, Any]):

    with open(status_path, "r+") as st:
        status_json = json.load(st)
        status_json[sha] = {**status_json[sha], **data}
        st.seek(0)
        json.dump(status_json, st)
        st.truncate()
