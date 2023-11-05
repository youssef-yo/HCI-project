<div align="center">
    <img align="center" src="/ui/src/assets/images/pawlsLogo.png" alt="OntoPAWLS icon" />
</div>

---

ONTO-PAWLS is a web application that lets you annotate documents in the format of PDF.
The annotations are created using also any ontology you provide in N-triples, RDF/XML or OWL/XML.

As of the latest main release, the key features are: 
- **PDF documents:** import PDF documents you want to annotate within the program.
- **Ontologies:** import one or more ontology files for semantic annotation.
- **Document annotations:** annotate entities and specify relations among them.
- **Annotation export:** export the annotations in a .nt file.
- **Collaborative annotation:** assign portions of a document to different users to be annotated, and commit their work when complete.
- **User management:** create, update and delete users. Two roles available, *administrator* and *annotator*.
- **Authentication:** log into an account using credentials.

## How To Use

For the first launch of the program, you must execute the following:

```shell
docker compose up --build
```

This command creates all the containers necessary to run the application. When you are finished, you can close the application (and thus destroy all containers) by using:

```shell
docker compose down
```

For all subsequent launches of the program, you will just need to execute:

```shell
docker compose up
```

When starting the program for the first time, you must authenticate as the default administrator, using the following base credentials:
- **Username**: devadmin@example.com
- **Password**: 12345

With the administrator account you can create all the other accounts you need (both admins and annotators), and login with them as well.

## Credits

ONTO-PAWLS was developed from the codebase of <a href="https://github.com/allenai/pawls">PAWLS</a>.