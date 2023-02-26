import os
from fastapi import APIRouter

from utils.configuration import configuration


router = APIRouter(
    prefix="/api/ontology",
    tags=['Ontology']
)


@router.delete("/{filename}")
def deleteOntology(filename: str):
    def removeOntology():
        file_location = os.path.join(configuration.upload_ontology_directory, f"{filename}")
        path = os.path.abspath(file_location)

        os.remove(path)

    def removeDataJsonOntology():
        file_location = os.path.join(configuration.extracted_data_from_ontology_directory, f"{filename}.json")
        path = os.path.abspath(file_location)

        os.remove(path)

    removeOntology()
    removeDataJsonOntology()
    return "Files removed..."


@router.get("/names")
def getNamesOntologiesAlreadyUploaded():
    namesOfOnto = list()

    for file in os.listdir(configuration.extracted_data_from_ontology_directory):
        if file.endswith('.json'):
            result = file.split('.json')[0]
            namesOfOnto.append(result)

    return {"ontologiesNames": namesOfOnto}
