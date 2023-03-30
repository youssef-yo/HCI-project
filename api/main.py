from fastapi import (
    FastAPI,
    Response,
    status
)

from core.events import lifespan
from core.logging import configure_logging

from routers import api


def get_application() -> FastAPI:
    configure_logging()

    application = FastAPI(
        title="ONTO-PAWLS",
        lifespan=lifespan
    )

    application.include_router(api.router, prefix="/api")

    return application


app = get_application()


@app.get("/", status_code=status.HTTP_204_NO_CONTENT)
def read_root():
    """
    Skiff's sonar, and the Kubernetes health check, require
    that the server returns a 2XX response from it's
    root URL, so it can tell the service is ready for requests.
    """
    return Response(status_code=status.HTTP_204_NO_CONTENT)
