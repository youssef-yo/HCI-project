import { MdDeleteOutline, MdOutlineEdit, MdOutlineNoteAdd } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Ontology, useOntologyApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { UploadOntoModal } from '../../components/dashboard';

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
            <Header>
                <h1>Ontologies</h1>
                <Button
                    color="secondary"
                    icon={<MdOutlineNoteAdd />}
                    onClick={() => setOntoModal(true)}>
                    Upload Ontology
                </Button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
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
                                    gap: '8px',
                                }}>
                                <IconButton title="Edit Ontology">
                                    <MdOutlineEdit />
                                </IconButton>
                                <IconButton
                                    title="Delete Ontology"
                                    onClick={() => removeOntology(onto._id)}>
                                    <MdDeleteOutline />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <UploadOntoModal show={ontoModal} onHide={handleModalClose} />
        </section>
    );
};

export default Ontologies;
