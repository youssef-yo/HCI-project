from datetime import datetime, timezone
from pydantic import BaseConfig, BaseModel


def convert_datetime_to_realworld(dt: datetime) -> str:
    return dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")


def convert_field_to_camel_case(string: str) -> str:
    return "".join(
        word if index == 0 else word.capitalize()
        for index, word in enumerate(string.split("_"))
    )


class RWSchema(BaseModel):
    """
    Basic read and write schema model.
    Limit the use of this class only for the schemas that represent the response from the server.
    """
    class Config(BaseConfig):
        populate_by_name = True
        alias_generator = convert_field_to_camel_case
        json_encoders = {datetime: convert_datetime_to_realworld}
