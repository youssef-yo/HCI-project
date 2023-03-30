import os
from typing import List

from fastapi import (
    APIRouter,
    status
)

from core.config import settings


router = APIRouter()


@router.delete("/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ontology(filename: str):
    def removeOntology():
        file_location = os.path.join(settings.upload_ontology_directory, f"{filename}")
        path = os.path.abspath(file_location)

        os.remove(path)

    def removeDataJsonOntology():
        file_location = os.path.join(settings.extracted_data_from_ontology_directory, f"{filename}.json")
        path = os.path.abspath(file_location)

        os.remove(path)

    removeOntology()
    removeDataJsonOntology()
    return "Files removed..."


@router.get("/names")
def get_names_ontologies_already_uploaded():
    namesOfOnto = list()

    for file in os.listdir(settings.extracted_data_from_ontology_directory):
        if file.endswith('.json'):
            result = file.split('.json')[0]
            namesOfOnto.append(result)

    return {"ontologiesNames": namesOfOnto}
