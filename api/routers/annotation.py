import glob
import json
import os
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from fastapi.responses import FileResponse

from app import export

from models.domain import UserDocument
from models.schemas import (
    PydanticObjectId
)

from core.config import Settings, get_settings

from services.oauth2 import get_current_user


router = APIRouter()


@router.get("/{sha}/export")
def export_annotations(
    sha: str,
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    annotations = os.path.join(
        settings.output_directory, sha, f"{user.email}_annotations.json"
    )
    exists = os.path.exists(annotations)

    path_pdfs_satus = os.path.join(settings.output_directory, "status", f"{user.email}.json")

    with open(path_pdfs_satus, "r") as f:
        pdfs_satus = json.load(f)

    total_pages = pdfs_satus[sha]["totalPages"]
    path_document = pdfs_satus[sha]["path"]
    abspath_document = os.path.abspath(path_document)

    if not exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"pdf {sha} not found."
        )

    abspath_annotations = os.path.abspath(annotations)
    path_export = os.path.join(
        settings.directory_extracted_annotations, f"{sha}_extractedAnnotations"
    )
    abspath_export = os.path.abspath(path_export)

    # export the annotations end get path where the file generated has been saved
    abspath_export_result = export.export_annotations(
        abspath_annotations,
        abspath_export,
        sha,
        abspath_document,
        total_pages
    )
    filename_export_result = abspath_export_result.split("/")[-1]

    # per export di nt:
    # return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers":"Content-Disposition"}, media_type="application/n-triples", filename=filename_export_result)
    # per export di ttl:
    return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers": "Content-Disposition"}, media_type="text/turtle", filename=filename_export_result)


def all_pdf_shas() -> List[str]:
    pdfs = glob.glob(f"{get_settings().output_directory}/*/*.pdf")
    return [p.split("/")[-2] for p in pdfs]


@router.get("/{sha}/export/{commit_id}")
async def export_commit_annotations(
    sha: PydanticObjectId,
    commit_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Exports the annotations at a specific document commit.
    """
    pass
