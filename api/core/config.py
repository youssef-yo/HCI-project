import os

from app import pre_serve

from utils.utils import create_folder


CONFIGURATION_FILE = os.getenv(
    "PAWLS_CONFIGURATION_FILE", "/usr/local/src/skiff/app/api/config/configuration.json"
)

# The annotation app requires a bit of set up.
configuration = pre_serve.load_configuration(CONFIGURATION_FILE)

# Build directories and files
create_folder(configuration.output_directory)

create_folder(configuration.upload_ontology_directory)

create_folder(configuration.extracted_data_from_ontology_directory)

create_folder(configuration.directory_extracted_annotations)
