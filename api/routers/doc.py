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
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder

from models.schemas.annotations import Annotation, PdfAnnotation, RelationGroup
from models.domain.users import UserDocument

from services.oauth2 import get_current_user

from core.config import settings


router = APIRouter()


@router.get("/{sha}/pdf", response_class=FileResponse)
async def get_pdf(sha: str):
    """
    Fetches a PDF.

    sha: str
        The sha of the pdf to return.
    """
    pdf = os.path.join(settings.output_directory, sha, f"{sha}.pdf")
    pdf_exists = os.path.exists(pdf)
    if not pdf_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"pdf {sha} not found."
        )

    return FileResponse(pdf, media_type="application/pdf")


@router.get("/{sha}/title")
async def get_pdf_title(sha: str) -> Optional[str]:
    """
    Fetches a PDF's title.

    sha: str
        The sha of the pdf title to return.
    """
    pdf_info = os.path.join(settings.output_directory, "pdf_metadata.json")

    with open(pdf_info, "r") as f:
        info = json.load(f)

    data = info.get("sha", None)

    if data is None:
        return None

    return data.get("title", None)


@router.post("/{sha}/comments")
def set_pdf_comments(
    sha: str, comments: str = Body(...), user: UserDocument = Depends(get_current_user)
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
    sha: str, junk: bool = Body(...), user: UserDocument = Depends(get_current_user)
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
    sha: str, finished: bool = Body(...), user: UserDocument = Depends(get_current_user)
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
    sha: str, user: UserDocument = Depends(get_current_user)
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


@router.get("/{sha}/tokens")
def get_tokens(sha: str):
    """
    sha: str
        PDF sha to retrieve tokens for.
    """
    pdf_tokens = os.path.join(settings.output_directory, sha, "pdf_structure.json")
    if not os.path.exists(pdf_tokens):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tokens for pdf."
        )
    with open(pdf_tokens, "r") as f:
        response = json.load(f)

    return response


def update_status_json(status_path: str, sha: str, data: Dict[str, Any]):

    with open(status_path, "r+") as st:
        status_json = json.load(st)
        status_json[sha] = {**status_json[sha], **data}
        st.seek(0)
        json.dump(status_json, st)
        st.truncate()