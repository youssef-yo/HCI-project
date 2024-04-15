import logging
import os

from app.utils import StackdriverJsonFormatter


def configure_logging() -> None:
    IN_PRODUCTION = os.getenv("IN_PRODUCTION", "dev")

    handlers = None

    if IN_PRODUCTION == "prod":
        json_handler = logging.StreamHandler()
        json_handler.setFormatter(StackdriverJsonFormatter())
        handlers = [json_handler]

    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", default=logging.DEBUG), handlers=handlers
    )

    logging.getLogger("uvicorn")

    # boto3 logging is _super_ verbose.
    logging.getLogger("boto3").setLevel(logging.CRITICAL)
    logging.getLogger("botocore").setLevel(logging.CRITICAL)
    logging.getLogger("nose").setLevel(logging.CRITICAL)
    logging.getLogger("s3transfer").setLevel(logging.CRITICAL)
