import os

from utils.utils import create_folder


class Settings:
    # All of this will turn into MongoDB collections... eventually... and hopefully...
    upload_ontology_directory: str = "onto/"
    directory_extracted_annotations: str = "extracted_annotations/"
    extracted_data_from_ontology_directory: str = "onto/extractedData"
    output_directory: str = "/skiff_files/apps/pawls/papers/"

    # This are default development values, the real values must be set in a .env file
    # to get a string like this run:
    # openssl rand -hex 32
    access_token_secret: str = os.getenv(
        "ACCESS_TOKEN_SECRET", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    refresh_token_secret: str = os.getenv(
        "REFRESH_TOKEN_SECRET", "7eeef6cceaba350ddc132e676c2f60941fc89b4d60870dc5ca11f36722aca1c7")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 20)
    refresh_token_expire_days: int = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30)

    # Base admin credentials
    base_admin_email: str = os.getenv("BASE_ADMIN_EMAIL", "devadmin@example.com")
    base_admin_pwd: str = os.getenv("BASE_ADMIN_PWD", "12345")

    # Database properties
    mongodb_uri: str = os.getenv('MONGODB_URI', 'mongodb://devusername:devpassword@mongodb:27017/')
    db_name: str = os.getenv("DB_NAME", "ontopawls")
    users_collection: str = os.getenv("DB_USERS_COLLECTION", "users")


# The annotation app requires a bit of set up.
settings = Settings()

# Build directories and files
create_folder(settings.output_directory)

create_folder(settings.upload_ontology_directory)

create_folder(settings.extracted_data_from_ontology_directory)

create_folder(settings.directory_extracted_annotations)
