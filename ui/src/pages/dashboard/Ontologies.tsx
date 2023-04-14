import { MdDeleteOutline } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Ontology, useOntologyApi, useUploadApi } from '../../api';
import { Button, Form, Modal } from 'react-bootstrap';
import { InputFile, FileList } from '../../components/sidebar';

const Ontologies = () => {
    const [ontos, setOntos] = useState<Ontology[]>([]);
    const [ontoModal, setOntoModal] = useState<boolean>(false);

    const { deleteOntology, getOntologiesList } = useOntologyApi();

    useEffect(() => {
        loadOntologies();
    }, []);

    const loadOntologies = () => {
        getOntologiesList()
            .then((ontos) => setOntos(ontos))
            .catch((err) => console.error(err));
    };

    const handleModalClose = () => {
        console.log('Closing modal');
        setOntoModal(false);
        loadOntologies();
    };

    const removeOntology = async (onto: string) => {
        await deleteOntology(onto);
        setOntos(ontos.filter((o) => o._id !== onto));
    };

    return (
        <section>
            <h1>Ontologies</h1>

            <Button variant="primary" onClick={() => setOntoModal(true)}>
                Upload Ontology
            </Button>
            <UploadOntoModal show={ontoModal} onHide={handleModalClose} />

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ontos.map((onto) => (
                        <tr key={onto._id}>
                            <td>{onto.name}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <div
                                    className="iconButton"
                                    onClick={() => removeOntology(onto._id)}>
                                    <MdDeleteOutline />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

type UploadOntoModalProps = {
    show: boolean;
    onHide: () => void;
};

const UploadOntoModal: React.FC<UploadOntoModalProps> = ({ show, onHide }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [anyFileUploaded, setAnyFileUploaded] = useState<boolean>(false);
    const supportedFiles = 'N-Triples, RDF/XML, OWL/XML';

    // const { deleteOntology } = useOntologyApi();
    const { uploadOntology } = useUploadApi();

    const changeStateFileIsUploading = (value: boolean) => {
        setIsUploading(value);
        console.log('File is uploding? ', isUploading);
    };

    const changeStateAnyFileUploaded = (value: boolean) => {
        setAnyFileUploaded(value);
        console.log('Any file was uploaded? ', isUploading);
        // if no file was uploaded then there is no need to refreshh the page after the modal is closed.
    };

    const updateFiles = (_file: string) => {
        setFiles([...files, _file]);
    };

    const removeFile = (_file: string) => {
        // For now it does nothing, when we'll load documents in MongoDB, we'll take care of this...
        // deleteOntology(_file);
        // setFiles(files.filter((file: any) => file.name !== _file));
        console.log('Tried deleting file...');
    };

    const handleClose = () => {
        if (anyFileUploaded && !isUploading) {
            onHide();
            window.location.reload();
        }
        if (!anyFileUploaded && !isUploading) {
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Ontology</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputFile
                    files={files}
                    updateFiles={updateFiles}
                    changeStateFileIsUploading={changeStateFileIsUploading}
                    changeStateAnyFileUploaded={changeStateAnyFileUploaded}
                    api={(onto: any) => uploadOntology(onto)}
                    supportedFiles={supportedFiles}></InputFile>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <FileList files={files} removeFile={removeFile} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Ontologies;
