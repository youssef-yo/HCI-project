import os

from fastapi import (
    APIRouter,
    Depends,
    status
)

from core.config import Settings, get_settings


router = APIRouter()


@router.delete("/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ontology(
    filename: str,
    settings: Settings = Depends(get_settings)
):
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
def get_names_ontologies_already_uploaded(
    settings: Settings = Depends(get_settings)
):
    namesOfOnto = list()

    for file in os.listdir(settings.extracted_data_from_ontology_directory):
        if file.endswith('.json'):
            result = file.split('.json')[0]
            namesOfOnto.append(result)

    return {"ontologiesNames": namesOfOnto}
