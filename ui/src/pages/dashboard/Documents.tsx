import { MdDeleteOutline, MdOpenInNew, MdOutlineNoteAdd } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Doc, useDocumentApi } from '../../api';
import { UploadDocModal } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Documents.scss';
import { useDialog } from '../../hooks';


const DocumentsPage = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [polling, setPolling] = useState<boolean>(false); 
    const [uploadDocModal, setUploadDocModal] = useState<boolean>(false);
    
    const { getAllDocs, updateDocumentInformation, deleteDocument } = useDocumentApi();
    const navigate = useNavigate();
    const dialog = useDialog();

    const loadDocs = () => {
        getAllDocs()
            .then((docs) => setDocs(docs))
            .catch((err) => console.error(err));
    };

    const handleUploadModalClose = () => {
        setUploadDocModal(false);
        loadDocs();
    };

    const checkAnalyzed = () => {
        if (docs.some(doc => !doc.analyzed) && !polling) {
            setPolling(true);
            const intervalId = setInterval(() => {
                const uncheckedDocumentIds = docs.filter(doc => !doc.analyzed).map(doc => doc._id);
                try {
                    updateDocumentInformation(uncheckedDocumentIds);
                    loadDocs();
                    clearInterval(intervalId);
                    setPolling(false);
                } catch (error) {
                    console.log(error);
                    // TODO: manage error
                }
            }, 5000);
            
            return () =>  {
                clearInterval(intervalId);
                setPolling(false);
            };
        }
    }

    useEffect(() => {
        loadDocs();   
    }, []);
    
    useEffect(() => {
        checkAnalyzed();   
    }, [docs]);

    // TODO: aggiungi modal dove dici "sei sicuro di ..."
    const onDeleteDoc = async (doc: Doc) => {
        const confirm = await dialog.showConfirmation(
            'Deleting Doc',
            `Are you sure you want to delete the document ${doc.name}? All tasks related to this document will also be eliminated. This action cannot be undone.`
        );
        if (!confirm) return;

        await deleteDocument(doc._id)
            .then((_) => loadDocs())
            .catch((err) => console.log(err));
    }

    return (
        <section>
            <Header>
                <h1>Documents</h1>
                <Button
                    color="secondary"
                    marginLeft="auto"
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
                        >
                            <td style={{ textAlign: 'center' }}>
                                <div className={!doc.analyzed ? 'status-dot load' : 'status-dot'} style={{ backgroundColor: !doc.analyzed ? 'yellow' : 'green' }}></div>
                            </td>
                            <td>{doc.name}</td>
                            <td style={{ textAlign: 'center' }}>{!doc.analyzed ? 'LOADING' : doc.totalPages}</td>
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
                                    disabled={!doc.analyzed}>
                                    <MdOpenInNew />
                                </IconButton>
                                <IconButton title="Delete Doc" onClick={() => onDeleteDoc(doc)} disabled={!doc.analyzed}>
                                    <MdDeleteOutline/>
                                </IconButton>                                
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>

            <UploadDocModal
                updateTable={loadDocs}
                checkAnalyzed={checkAnalyzed}
                show={uploadDocModal}
                onHide={handleUploadModalClose}
            />
        </section>
    );
};

export default DocumentsPage;
