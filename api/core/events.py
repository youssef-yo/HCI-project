from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.events import (
    connect_to_db,
    close_db_connection
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create the connection with the database
    await connect_to_db()

    yield

    # Close the connection with the database
    close_db_connection()
