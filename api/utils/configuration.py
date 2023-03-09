import logging
import os

from app import pre_serve
from app.utils import StackdriverJsonFormatter

from .utils import create_folder, create_json_file


IN_PRODUCTION = os.getenv("IN_PRODUCTION", "dev")

CONFIGURATION_FILE = os.getenv(
    "PAWLS_CONFIGURATION_FILE", "/usr/local/src/skiff/app/api/config/configuration.json"
)

handlers = None

if IN_PRODUCTION == "prod":
    json_handler = logging.StreamHandler()
    json_handler.setFormatter(StackdriverJsonFormatter())
    handlers = [json_handler]

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", default=logging.INFO), handlers=handlers
)

logger = logging.getLogger("uvicorn")

# boto3 logging is _super_ verbose.
logging.getLogger("boto3").setLevel(logging.CRITICAL)
logging.getLogger("botocore").setLevel(logging.CRITICAL)
logging.getLogger("nose").setLevel(logging.CRITICAL)
logging.getLogger("s3transfer").setLevel(logging.CRITICAL)

# The annotation app requires a bit of set up.
configuration = pre_serve.load_configuration(CONFIGURATION_FILE)

# Build directories and files
create_folder(configuration.output_directory)

create_folder(configuration.users_directory)
create_json_file(configuration.users_directory, configuration.users_file, [])

create_folder(configuration.upload_ontology_directory)

create_folder(configuration.extracted_data_from_ontology_directory)

create_folder(configuration.directory_extracted_annotations)