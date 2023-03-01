import json
import os
from typing import Optional, List

from fastapi import HTTPException, status

from schemas.users import UserDB

from utils.configuration import configuration, logger


def load_users() -> List[UserDB]:
    """
    Loads users from the users JSON file and converts them to the pydantic database model.
    """
    users_path = os.path.join(configuration.users_directory, configuration.users_file)
    exists = os.path.exists(users_path)

    if not exists:
        return []

    with open(users_path) as f:
        json_users = json.load(f)
        users = json_users["users"]
        return [UserDB(**user) for user in users]


def save_users(users: List[UserDB]):
    """
    Saves users in the users JSON file
    """
    users_path = os.path.join(configuration.users_directory, configuration.users_file)

    with open(users_path, "w+") as f:
        json.dump({"users": [user.dict() for user in users]}, f)


def load_user(email: str) -> Optional[UserDB]:
    """
    Returns the user with the specified email if found, else None
    """
    users = load_users()

    for stored_user in users:
        if stored_user.email == email:
            return stored_user

    return None


def save_user(user: UserDB):
    """
    Saves or updates the given user in the user JSON file
    """
    users = load_users()

    for index, stored_user in enumerate(users):
        if stored_user.email == user.email:
            users[index] = user
            save_users(users)
            return

    users.append(user)

    save_users(users)


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
    user = load_user(user_email)
    True if user else False

    # try:
    #     with open(configuration.users_file) as file:
    #         for line in file:
    #             entry = line.strip()
    #             if user_email == entry:
    #                 return True
    #             # entries like "@allenai.org" mean anyone in that domain @allenai.org is granted access
    #             if entry.startswith("@") and user_email.endswith(entry):
    #                 return True
    # except FileNotFoundError:
    #     logger.warning("file not found: %s", configuration.users_file)
    #     pass

    # return False
