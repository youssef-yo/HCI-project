import logging

from db.database import initialize_db, close_db


async def connect_to_db():
    """
    Establishes a connection with the MongoDB database container.
    """
    logging.getLogger('uvicorn').info('Connecting to MongoDB...')

    await initialize_db()

    logging.getLogger('uvicorn').info('Connection with MongoDB established.')


def close_db_connection():
    """
    Terminates the connection with the MongoDB database container.
    """
    logging.getLogger('uvicorn').info('Attempting to close the connection with MongoDB...')

    close_db()

    logging.getLogger('uvicorn').info('Connection with MongoDB terminated.')
