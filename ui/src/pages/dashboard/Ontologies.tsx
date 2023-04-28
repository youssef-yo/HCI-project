import { MdDeleteOutline, MdOutlineEdit, MdOutlineNoteAdd } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Ontology, useOntologyApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { EditOntoModal, UploadOntoModal } from '../../components/dashboard';

const OntologiesPage = () => {
    const [ontos, setOntos] = useState<Ontology[]>([]);
    const [editedOnto, setEditedOnto] = useState<string>('');
    const [editOntoModal, setEditOntoModal] = useState<boolean>(false);
    const [uploadOntoModal, setUploadOntoModal] = useState<boolean>(false);

    const { deleteOntology, getOntologiesList } = useOntologyApi();

    useEffect(() => {
        loadOntologies();
    }, []);

    const loadOntologies = () => {
        getOntologiesList()
            .then((ontos) => setOntos(ontos))
            .catch((err) => console.error(err));
    };

    const handleEditModalClose = () => {
        console.log('Closing edit modal');
        setEditOntoModal(false);
    };

    const handleUploadModalClose = () => {
        console.log('Closing upload modal');
        setUploadOntoModal(false);
        loadOntologies();
    };

    const onEditOntology = (id: string) => {
        setEditedOnto(id);
        setEditOntoModal(true);
    };

    const onOntoUpdated = (updatedOnto: Ontology) => {
        const updatedOntos = ontos.map((o) => (o._id === updatedOnto._id ? updatedOnto : o));
        setOntos(updatedOntos);
    };

    const onDeleteOntology = async (onto: string) => {
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
                    onClick={() => setUploadOntoModal(true)}>
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
                                <IconButton
                                    title="Edit Ontology"
                                    onClick={() => onEditOntology(onto._id)}>
                                    <MdOutlineEdit />
                                </IconButton>
                                <IconButton
                                    title="Delete Ontology"
                                    onClick={() => onDeleteOntology(onto._id)}>
                                    <MdDeleteOutline />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <EditOntoModal
                show={editOntoModal}
                onHide={handleEditModalClose}
                ontoID={editedOnto}
                onUpdate={onOntoUpdated}
            />
            <UploadOntoModal show={uploadOntoModal} onHide={handleUploadModalClose} />
        </section>
    );
};

export default OntologiesPage;
