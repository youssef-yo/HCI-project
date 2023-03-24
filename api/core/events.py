from typing import Callable

from db.events import (
    connect_to_db,
    close_db_connection
)


def create_start_app_handler() -> Callable:
    def start_app() -> None:
        connect_to_db()

    return start_app


def create_stop_app_handler() -> Callable:
    def stop_app() -> None:
        close_db_connection()

    return stop_app
