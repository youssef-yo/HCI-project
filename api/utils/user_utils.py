import json
import os
from typing import Optional, List

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
        users = json.load(f)
        return [UserDB(**user) for user in users]


def save_users(users: List[UserDB]):
    """
    Saves users in the users JSON file
    """
    users_path = os.path.join(configuration.users_directory, configuration.users_file)

    with open(users_path, "w+") as f:
        json.dump([user.dict() for user in users], f)


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
