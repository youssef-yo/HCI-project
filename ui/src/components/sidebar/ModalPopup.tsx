import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputFile from './inputFile';
import FileList from './FileList';
import { getDataOfOntologiesSelected, getNamesOfOntologiesAlreadyUploaded } from '../../api/index';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    const [show, setShow] = useState(false);
    const [files, setFiles]: [files: any, setFiles: any] = useState([]);
    // all'inizio forse devo richiedere all'api la lista dei file già caricati
    useEffect(() => {
        // Chiamo api: dammi lista dei file che sono già stati caricati predentemente
        getNamesOfOntologiesAlreadyUploaded().then((result) => {
            console.log('Result of promise.then: ', result);
            console.log('List:', result.ontologiesNames);
            if (result.ontologiesNames.length > 0) {
                const names = result.ontologiesNames.map((value: any) => ({
                    key: value, // forse non serve più
                    name: value,
                }));
                setFiles(names);
            }
        });
        console.log('files...:', files);
        /*
        console.log(
            'response: ',
            Promise.resolve(response).then((r) => r.data)
        );
        */
    }, []);
    const removeFile = (filename: any) => {
        setFiles(files.filter((file: any) => file.name !== filename));
    };
    // forse meglio gestire qui il set dei valori del Menù dei labels (vedi uso di Context in react)
    const handleClose = () => {
        // Chiamata Api: dammi i dati delle ontologie che ti mando
        // ricevuti i dati setto il context di Dropdowm.
        // getDataOfOntologiesSelected(files);
        askDataOfOntologies();
        setShow(false);
    };
    const handleShow = () => setShow(true);
    const askDataOfOntologies = () => {
        const result: string[] = [];
        files.map((f: any) => result.push(f.name));
        console.log('Result names of onto: ', result);
        getDataOfOntologiesSelected(result);
    };
    const updateFiles = (_file: any) => {
        setFiles([...files, _file]);
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Manage Ontologies
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Ontologies</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputFile files={files} updateFiles={updateFiles}></InputFile>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <FileList files={files} removeFile={removeFile} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default App;