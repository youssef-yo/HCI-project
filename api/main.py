from fastapi import (
    FastAPI,
    Response,
    status
)

from core.events import (
    create_start_app_handler,
    create_stop_app_handler
)

from routers import (
    annotation,
    auth,
    doc,
    logout,
    ontology,
    refresh,
    upload,
    user
)


app = FastAPI()

app.add_event_handler(
    "startup",
    create_start_app_handler()
)

app.add_event_handler(
    "shutdown",
    create_stop_app_handler()
)

app.include_router(annotation.router)
app.include_router(auth.router)
app.include_router(doc.router)
app.include_router(logout.router)
app.include_router(ontology.router)
app.include_router(refresh.router)
app.include_router(upload.router)
app.include_router(user.router)


@app.get("/", status_code=status.HTTP_204_NO_CONTENT)
def read_root():
    """
    Skiff's sonar, and the Kubernetes health check, require
    that the server returns a 2XX response from it's
    root URL, so it can tell the service is ready for requests.
    """
    return Response(status_code=status.HTTP_204_NO_CONTENT)
