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
    RelationGroup
)
from models.domain import DocumentDocument, UserDocument

from services.oauth2 import get_current_user

from core.config import Settings, get_settings


router = APIRouter()


@router.get("", response_model=List[DocumentOutResponse])
async def get_all_documents():
    docs = await DocumentDocument.find({}).to_list()
    return docs


@router.get("/{sha}", response_model=DocumentOutResponse)
async def get_document(
    sha: str
):
    doc = await DocumentDocument.get(sha)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {sha} not found."
        )
    
    return doc


@router.get("/{sha}/pdf", response_class=Response)
async def get_pdf(
    sha: str,
    db: MongoClient = Depends(get_db)
):
    """
    Fetches the PDF file that belongs to a document.
    """
    pdf = await DocumentDocument.get(sha)
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document with ID {sha} not found."
        )
    
    # Retrieve the document file from GridFS
    grid_out = await db.gridFS.open_download_stream(pdf.file_id)
    file = await grid_out.read()

    return Response(file, media_type="application/pdf")


@router.post("/{sha}/comments")
def set_pdf_comments(
    sha: str,
    comments: str = Body(...),
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    status_path = os.path.join(settings.output_directory, "status", f"{user.email}.json")
    exists = os.path.exists(status_path)

    if not exists:
        # Not an allocated user. Do nothing.
        return {}

    update_status_json(status_path, sha, {"comments": comments})
    return {}


@router.post("/{sha}/junk")
def set_pdf_junk(
    sha: str,
    junk: bool = Body(...),
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    status_path = os.path.join(settings.output_directory, "status", f"{user.email}.json")
    exists = os.path.exists(status_path)
    if not exists:
        # Not an allocated user. Do nothing.
        return {}

    update_status_json(status_path, sha, {"junk": junk})
    return {}


@router.post("/{sha}/finished")
def set_pdf_finished(
    sha: str,
    finished: bool = Body(...),
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    status_path = os.path.join(settings.output_directory, "status", f"{user.email}.json")
    exists = os.path.exists(status_path)
    if not exists:
        # Not an allocated user. Do nothing.
        return {}

    update_status_json(status_path, sha, {"finished": finished})
    return {}


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


@router.get("/{sha}/tokens", response_model=List[Page])
async def get_tokens(
    sha: str,
    db: MongoClient = Depends(get_db)
):
    """
    Gets the PDF structure (pages and tokens) of the file belonging to a document.
    """
    pdf = await DocumentDocument.get(sha)
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document with ID {sha} not found."
        )

    return pdf.structure


# @router.get("/{sha}/tokens")
# def get_tokens(
#     sha: str,
#     settings: Settings = Depends(get_settings)
# ):
#     """
#     sha: str
#         PDF sha to retrieve tokens for.
#     """
#     pdf_tokens = os.path.join(settings.output_directory, sha, "pdf_structure.json")
#     if not os.path.exists(pdf_tokens):
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="No tokens for pdf."
#         )
#     with open(pdf_tokens, "r") as f:
#         response = json.load(f)

#     return response


def update_status_json(status_path: str, sha: str, data: Dict[str, Any]):

    with open(status_path, "r+") as st:
        status_json = json.load(st)
        status_json[sha] = {**status_json[sha], **data}
        st.seek(0)
        json.dump(status_json, st)
        st.truncate()
