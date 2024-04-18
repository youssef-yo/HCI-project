import { MdOpenInNew, MdOutlineNoteAdd } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Doc, useDocumentApi } from '../../api';
import { UploadDocModal } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Documents.scss';

const DocumentsPage = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [uploadDocModal, setUploadDocModal] = useState<boolean>(false);

    const { getAllDocs } = useDocumentApi();
    const navigate = useNavigate();

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

    useEffect(() => {
        if (docs.some(doc => doc.name.endsWith('.LOADING'))) {
            loadDocs();
        }
    }, [docs]);

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

            <Table color="#0077B6">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>Nothing to show</td>
                        </tr>
                    ) : (docs.map((doc) => (
                         <tr
                            key={doc._id}
                            // className={doc.name.endsWith('.LOADING') ? 'loading' : 'standard'}
                        >
                            <td style={{ textAlign: 'center' }}>
                                <div className={doc.name.endsWith('.LOADING') ? 'status-dot load' : 'status-dot'} style={{ backgroundColor: doc.name.endsWith('.LOADING') ? 'yellow' : 'green' }}></div>
                            </td>
                            <td>{doc.name.endsWith('.LOADING') ? doc.name.replace('.LOADING', '') : doc.name}</td>
                            <td style={{ textAlign: 'center' }}>{doc.name.endsWith('.LOADING') ? '?' : doc.totalPages}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton
                                    title="View Document"
                                    onClick={() => navigate(`${doc._id}`)}
                                    disabled={doc.name.endsWith('.LOADING')}>
                                    <MdOpenInNew />
                                </IconButton>
                                
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>

            <UploadDocModal
                updateTable={loadDocs}
                show={uploadDocModal}
                onHide={handleUploadModalClose}
            />
        </section>
    );
};

export default DocumentsPage;
