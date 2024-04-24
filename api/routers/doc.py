from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from fastapi.responses import Response

from db.database import MongoClient, get_db

from models.schemas import (
    DocAnnotations,
    DocCommitOutResponse,
    DocumentOutResponse,
    Page,
    DocAnnotations,
    PydanticObjectId
)
from models.domain import (
    DocCommitDocument,
    DocumentDocument,
    DocStructureDocument,
    UserDocument,
    TaskDocument
)

from services.doc import (
    get_document_by_id,
    get_document_structure,
    get_document_commit_by_id,
    get_document_commit_annotations
)
from services.oauth2 import get_current_user


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


@router.get("/{sha}/commits", response_model=List[DocCommitOutResponse])
async def get_document_commits(
    sha: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Gets the commits that have been created so far for the specified document.
    """
    doc_commits = await DocCommitDocument.find_many(DocCommitDocument.doc_id == sha).sort(-DocCommitDocument.created_at).to_list()
    return doc_commits


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


@router.get("/commits/{commit_id}", response_model=DocCommitOutResponse)
async def get_document_commit(
    commit_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Gets a specific commit that has been created.
    """
    doc_commit = await get_document_commit_by_id(commit_id, assert_exists=True)
    return doc_commit


@router.get("/commits/{commit_id}/annotations", response_model=DocAnnotations)
async def get_commit_annotations(
    commit_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Gets the annotations of the specified commit, belonging to a document.
    """
    commit_annotations = await get_document_commit_annotations(commit_id)
    return commit_annotations


@router.post("/updateDocs")
async def update_documents(
    ids: List[str] = []
):
    for doc_id in ids:
        try:
            document = await DocumentDocument.get(doc_id)
            try:
                
                structure = await DocStructureDocument.find_one(DocStructureDocument.doc_id == PydanticObjectId(doc_id))
                if structure: 
                    npages = len(structure.structure)
                    document.total_pages = npages
                    document.analyzed = True
                    await document.save()
                else:
                    raise HTTPException(status_code=404, detail=f"Structure not found for document with id {doc_id}")
            except Exception as e:
                raise HTTPException(status_code=404, detail=f"Structure not found for document with id {doc_id}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Doc not found with id {doc_id}")



@router.delete("/{doc_id}")
async def delete_doc(doc_id: PydanticObjectId):
    try:
        document = await DocumentDocument.get(doc_id)
        if document:
            
            structures = await DocStructureDocument.find({"doc_id": doc_id}).to_list()
            for structure in structures:
                await structure.delete()

            tasks = await TaskDocument.find({"doc_id": doc_id}).to_list()
            for task in tasks:
                await task.delete()
            
            doc_commits = await DocCommitDocument.find({"doc_id": doc_id}).to_list()
            for doc_commit in doc_commits:
                await doc_commit.delete()
            
            await document.delete()
    except Exception as e:
        raise e
