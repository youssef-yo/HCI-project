<div align="center">
    ONTO-PAWLS
</div>

------------------------------------------------
  ONTO-PAWLS is a web application that lets you annotate documents in the format of PDF.
  The annotations are created using also any ontology you provide in N-triples, RDF/XML or OWL/XML.
  
  Current functionalities: 
- Import one or more pdf documents
- Import one or more ontologies
- Annotate entities and relations
- Export the annotation in a .nt file
- **Collaborative annotation:** assign portions of a document to different users to be annotated, and commit their work when complete
- **User management:** create, update and delete users.Two roles available, *administrator* and *annotator*
- **Authentication:** log into an account using credentials

When starting the program for the first time, you must authenticate as the default administrator, using the following base credentials:
- **Username**: devadmin@example.com
- **Password**: 12345

ONTO-PAWLS was developed from the codebase of <a href="https://github.com/allenai/pawls">PAWLS</a>.
