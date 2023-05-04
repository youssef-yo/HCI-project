import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Input, InputType } from '../common';
import { Ontology, useOntologyApi } from '../../api';

type EditOntoModalProps = {
    show: boolean;
    onHide: () => void;
    ontoID: string;
    onUpdate: (onto: Ontology) => void;
};

const EditOntoModal: React.FC<EditOntoModalProps> = ({ show, onHide, ontoID, onUpdate }) => {
    const [name, setName] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    const { getOntologyByID, updateOntology } = useOntologyApi();

    useEffect(() => {
        if (!show || !ontoID) return;

        getOntologyByID(ontoID)
            .then((onto) => setName(onto.name))
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else {
                    setErrorMsg(err.response?.data?.detail);
                    console.error(err);
                }
            });
    }, [show, ontoID]);

    const handleClose = () => {
        setErrorMsg('');
        setName('');
        onHide();
    };

    const onEditOntology = async () => {
        if (name.trim().length === 0) {
            setErrorMsg('An ontology name must be specified!');
            return;
        }

        const ontoUpdate = {
            name: name,
        };

        updateOntology(ontoID, ontoUpdate)
            .then((onto) => {
                onUpdate(onto);
                handleClose();
            })
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else {
                    setErrorMsg(err.response?.data?.detail);
                    console.error(err);
                }
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Ontology</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {errorMsg && (
                        <p className="errorMsg" ref={errorRef}>
                            {errorMsg}
                        </p>
                    )}

                    <Input
                        type="text"
                        variant={InputType.STANDARD}
                        color="secondary"
                        id="name"
                        placeholder="Ontology Name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Discard Changes
                </Button>
                <Button variant="primary" onClick={onEditOntology}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditOntoModal;

const Form = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 25px;

    .errorMsg {
        position: relative;
        width: 100%;
        padding: 15px 7.5px;
        margin-bottom: 0;
        border: 2px solid rgba(191, 11, 11, 1);
        border-radius: 4px;
        background: rgba(191, 11, 11, 0.15);
        color: #bf3f3f;
        font-size: 0.8em;
    }
`;
