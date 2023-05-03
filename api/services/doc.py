from fastapi import (
    HTTPException,
    status
)

from models.domain import (
    DocCommitDocument,
    DocStructureDocument,
    DocumentDocument
)
from models.schemas import (
    DocAnnotations,
    PydanticObjectId
)


async def get_document_by_id(
    id: PydanticObjectId,
    assert_exists: bool = False
) -> DocumentDocument:
    """
    Gets the document with the specified identifier.
    If it does not exist, and the assertion flag has been set,
    it raises an HTTPException.
    """
    doc = await DocumentDocument.get(id)
    if not doc and assert_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {id} not found."
        )

    return doc


async def get_document_structure(
    id: PydanticObjectId
) -> DocStructureDocument:
    """
    Gets the document structure (pages and tokens) of the document with the specified identifier.
    If it does not exist (meaning the document does not exist), it raises an HTTPException.
    """
    doc_structure = await DocStructureDocument.find_one(DocStructureDocument.doc_id == id)
    if not doc_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document with ID {id} not found."
        )

    return doc_structure


async def get_document_commit_by_id(
    id: PydanticObjectId,
    assert_exists: bool = False
) -> DocCommitDocument:
    """
    Gets the document commit with the specified identifier.
    If it does not exist, and the assertion flag has been set,
    it raises an HTTPException.
    """
    doc_commit = await DocCommitDocument.get(id)
    if not doc_commit and assert_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document commit with ID {id} not found."
        )

    return doc_commit


async def get_document_commit_annotations(
    id: PydanticObjectId
) -> DocAnnotations:
    """
    Gets the document annotations at the specified commit.
    If it does not exist, it raises an HTTPException.
    """
    doc_commit = await DocCommitDocument.get(id)
    if not doc_commit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document commit with ID {id} not found."
        )
    
    return doc_commit.doc_annotations
