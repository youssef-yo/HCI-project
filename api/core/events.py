from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.setup import setup_application

from db.events import (
    connect_to_db,
    close_db_connection
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles all the necessary setups for the API"""
    await connect_to_db()
    await setup_application()

    yield

    close_db_connection()
