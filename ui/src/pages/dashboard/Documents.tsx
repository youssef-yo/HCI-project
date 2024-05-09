import { MdDeleteOutline, MdOutlineNoteAdd, MdInfoOutline, MdCircle } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Doc, useDocumentApi, getApiError } from '../../api';
import { UploadDocModal } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Documents.scss';
import { useDialog } from '../../hooks';
import { notification } from '@allenai/varnish';

const DocumentsPage = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [polling, setPolling] = useState<boolean>(false); 
    const [uploadDocModal, setUploadDocModal] = useState<boolean>(false);
    
    const { getAllDocs, updateDocumentInformation, deleteDocument } = useDocumentApi();

    const [showExplanation, setShowExplanation] = useState(false);

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
            const intervalId = setInterval(async () => {
                const uncheckedDocumentIds = docs.filter(doc => !doc.analyzed).map(doc => doc._id);
                try {
                    await updateDocumentInformation(uncheckedDocumentIds);
                    loadDocs();
                    notification.success({
                        message: 'Document Analyzed!',
                        description: 'One of the document you uploaded is ready to be annotated.',
                        placement: 'bottomRight',
                    });
                    clearInterval(intervalId);
                    setPolling(false);
                } catch (error: any) {
                    if (error.response && error.response.status !== 500 && error.response.status !== 404) {
                        notification.error({
                            message: 'Could not analyze the document!',
                            description: error.response.data.detail, 
                            placement: 'bottomRight',
                        });
                    }
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

    const onDeleteDoc = async (doc: Doc) => {
        const confirm = await dialog.showConfirmation(
            'Delete Document',
            `Are you sure you want to delete the document ${doc.name}? All the tasks associated with this document will be
            also deleted. This action cannot be undone.`
        );
        if (!confirm) return;

        await deleteDocument(doc._id)
            .then((_) => {
                loadDocs();
                notification.success({
                    message: 'Document deleted succesfully!',
                    placement: 'bottomRight',
                });
            })
            .catch((err) =>
                notification.error({
                    message: 'Error deleting document!',
                    description: getApiError(err),
                    placement: 'bottomRight',
            }));
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

            <Table color="#0047AB">
                <thead>
                    <tr>
                        <th>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                Status 
                                <MdInfoOutline
                                        style={{ marginLeft: '4px', color: 'white' }}
                                        onMouseEnter={() => setShowExplanation(true)}
                                        onMouseLeave={() => setShowExplanation(false)}
                                    />
                                {showExplanation && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 5px)',
                                            left: '67%',
                                            transform: 'translateX(-50%)',
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            zIndex: '999',
                                            fontSize: '0.8em',
                                            minWidth: '6em', 
                                        }}
                                    >
                                        <p style={{ whiteSpace: 'nowrap' }}><MdCircle style={{ color: 'green' }}/>: Document ready</p>
                                        <p style={{ whiteSpace: 'nowrap' }}><MdCircle style={{ color: 'yellow' }}/>: analyzing document</p>
                                    </div>
                                    )}
                            </div>                        
                        </th>
                        <th>Name</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>Nothing to show</td>
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
                                    <MdInfoOutline />
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
