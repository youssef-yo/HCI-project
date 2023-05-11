import os

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from fastapi.responses import FileResponse

from app import export

from models.domain import UserDocument
from models.schemas import PydanticObjectId

from core.config import Settings, get_settings

from services.doc import get_document_by_id, get_document_commit_by_id
from services.oauth2 import get_current_user


router = APIRouter()


@router.get("/{sha}/export")
async def export_annotations(
    sha: str,
    user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    """
    Exports the latest annotations at a specific document.
    """
    document = await get_document_by_id(sha, assert_exists=True)

    if not document.commit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No commits have been made for this document yet."
        )

    commit = await get_document_commit_by_id(document.commit, assert_exists=True)

    data = commit.doc_annotations.dict()

    path_export = os.path.join(
        settings.directory_extracted_annotations, f"{document.name}-{commit.id}"
    )
    abspath_export = os.path.abspath(path_export)

    # export the annotations end get path where the file generated has been saved
    abspath_export_result = export.export_annotations(
        data,
        abspath_export,
        document.name,
        document.total_pages
    )
    filename_export_result = abspath_export_result.split("/")[-1]

    # per export di nt:
    # return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers":"Content-Disposition"}, media_type="application/n-triples", filename=filename_export_result)
    # per export di ttl:
    return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers": "Content-Disposition"}, media_type="text/turtle", filename=filename_export_result)


@router.get("/{sha}/export/{commit_id}")
async def export_commit_annotations(
    sha: PydanticObjectId,
    commit_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    """
    Exports the annotations of a specific document commit.
    """
    commit = await get_document_commit_by_id(commit_id, assert_exists=True)
    document = await get_document_by_id(commit.doc_id, assert_exists=True)

    data = commit.doc_annotations.dict()

    path_export = os.path.join(
        settings.directory_extracted_annotations, f"{document.name}-{commit.id}"
    )
    abspath_export = os.path.abspath(path_export)

    # export the annotations end get path where the file generated has been saved
    abspath_export_result = export.export_annotations(
        data,
        abspath_export,
        document.name,
        document.total_pages
    )
    filename_export_result = abspath_export_result.split("/")[-1]

    # per export di nt:
    # return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers":"Content-Disposition"}, media_type="application/n-triples", filename=filename_export_result)
    # per export di ttl:
    return FileResponse(abspath_export_result, headers={"Access-Control-Expose-Headers": "Content-Disposition"}, media_type="text/turtle", filename=filename_export_result)
