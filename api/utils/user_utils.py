import json
import os
from typing import Optional

from fastapi import HTTPException, status

from schemas.users import UserDB

from utils.configuration import configuration, logger


def load_user(email: str) -> Optional[UserDB]:
    user_path = os.path.join(configuration.users_directory, f"{email}.json")
    exists = os.path.exists(user_path)

    if not exists:
        return None

    with open(user_path) as f:
        user = json.load(f)
        return UserDB(
            email=user["email"],
            password=user["password"],
            role=user["role"]
        )


def save_user(user: UserDB):
    user_path = os.path.join(configuration.users_directory, f"{user.email}.json")

    with open(user_path, "w+") as f:
        json.dump(user.dict(), f)


def get_user_from_header(user_email: Optional[str]) -> Optional[str]:
    """
    Call this function with the X-Auth-Request-Email header value. This must
    include an "@" in its value.

    * In production, this is provided by Skiff after the user authenticates.
    * In development, it is provided in the NGINX proxy configuration file local.conf.

    If the value isn't well formed, or the user isn't allowed, an exception is
    thrown.
    """
    if "@" not in user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )

    if not user_is_allowed(user_email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )

    return user_email


def user_is_allowed(user_email: str) -> bool:
    """
    Return True if the user_email is in the users file, False otherwise.
    """
    try:
        with open(configuration.users_file) as file:
            for line in file:
                entry = line.strip()
                if user_email == entry:
                    return True
                # entries like "@allenai.org" mean anyone in that domain @allenai.org is granted access
                if entry.startswith("@") and user_email.endswith(entry):
                    return True
    except FileNotFoundError:
        logger.warning("file not found: %s", configuration.users_file)
        pass

    return False
