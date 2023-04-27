import { MdOpenInNew, MdOutlineEdit, MdOutlineNoteAdd } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Doc, useDocumentApi } from '../../api';
import { UploadDocModal } from '../../components/dashboard';

const Documents = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [uploadDocModal, setUploadDocModal] = useState<boolean>(false);

    const { getAllDocs } = useDocumentApi();

    const loadDocs = () => {
        getAllDocs()
            .then((docs) => setDocs(docs))
            .catch((err) => console.error(err));
    };

    const handleUploadModalClose = () => {
        console.log('Closing upload modal');
        setUploadDocModal(false);
        loadDocs();
    };

    useEffect(() => {
        loadDocs();
    }, []);

    return (
        <section>
            <Header>
                <h1>Documents</h1>
                <Button
                    color="secondary"
                    icon={<MdOutlineNoteAdd />}
                    onClick={() => setUploadDocModal(true)}>
                    Upload Document
                </Button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.map((doc) => (
                        <tr key={doc._id}>
                            <td>{doc.name}</td>
                            <td style={{ textAlign: 'center' }}>{doc.totalPages}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton title="View Document">
                                    <MdOpenInNew />
                                </IconButton>
                                <IconButton title="Edit Document">
                                    <MdOutlineEdit />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <UploadDocModal show={uploadDocModal} onHide={handleUploadModalClose} />
        </section>
    );
};

export default Documents;
