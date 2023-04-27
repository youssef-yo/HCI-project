from functools import lru_cache
from pydantic import BaseSettings

from utils.utils import create_folder


class Settings(BaseSettings):
    # All of this will turn into MongoDB collections... eventually... and hopefully...
    directory_extracted_annotations: str = "extracted_annotations/"
    output_directory: str = "/skiff_files/apps/pawls/papers/"

    # This are default development values, the real values must be set in a .env file
    # to get a string like this run:
    # openssl rand -hex 32
    access_token_secret: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    refresh_token_secret: str = "7eeef6cceaba350ddc132e676c2f60941fc89b4d60870dc5ca11f36722aca1c7"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 20
    refresh_token_expire_days: int = 30

    # Base admin credentials
    base_admin_email: str = "devadmin@example.com"
    base_admin_pwd: str = "12345"

    # Database properties
    mongodb_uri: str = "mongodb://devusername:devpassword@mongodb:27017/"
    db_name: str = "ontopawls"
    docs_collection: str = "documents"
    doc_structures_collection: str = "doc_structures"
    ontos_collection: str = "ontologies"
    tasks_collection: str = "tasks"
    users_collection: str = "users"


# The annotation app requires a bit of set up.
@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Build directories and files
create_folder(get_settings().output_directory)

create_folder(get_settings().directory_extracted_annotations)
