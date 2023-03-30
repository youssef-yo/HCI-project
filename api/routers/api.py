from fastapi import APIRouter

from routers import (
    annotation,
    auth,
    doc,
    ontology,
    upload,
    user
)


router = APIRouter()

router.include_router(annotation.router, tags=['Annotations'], prefix="/annotation")
router.include_router(auth.router, tags=['Authentication'])
router.include_router(doc.router, tags=['Documents'], prefix="/doc")
router.include_router(ontology.router, tags=['Ontologies'], prefix="/ontology")
router.include_router(upload.router, tags=['Uploads'], prefix="/upload")
router.include_router(user.router, tags=['Users'], prefix="/users")
