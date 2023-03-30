import logging

from core.config import get_settings

from models.domain.users import UserDocument

from services.security import hash_password


async def create_base_admin(email: str, password: str) -> None:
    admin = await UserDocument.find_one(UserDocument.email == email)
    if admin:
        logging.getLogger('uvicorn').info('Base admin user already exists, no need to create it.')
        return

    logging.getLogger('uvicorn').info('Base admin user not found, creating...')

    role = "Administrator"
    hashed_password = hash_password(password)

    admin = UserDocument(
        email=email,
        full_name="Onto-PAWLS Admin",
        role=role,
        hashed_password=hashed_password
    )
    await admin.create()
    logging.getLogger('uvicorn').info('Base admin user created.')


async def setup_application() -> None:
    await create_base_admin(get_settings().base_admin_email, get_settings().base_admin_pwd)
