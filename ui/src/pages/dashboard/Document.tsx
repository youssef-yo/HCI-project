import { MdAddTask, MdOutlineFileDownload, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Doc, Task, useDocumentApi, useTaskApi } from '../../api';

const DocumentPage = () => {
    const { docId } = useParams<{ docId: string }>();
    const [doc, setDoc] = useState<Doc>();
    const [tasks, setTasks] = useState<Task[]>([]);

    const { getDocumentByID } = useDocumentApi();
    const { getTasks } = useTaskApi();
    const navigate = useNavigate();

    useEffect(() => {
        if (!docId) {
            // TODO
            console.error('No document has been selected!');
            return;
        }

        getDocumentByID(docId)
            .then((doc) => setDoc(doc))
            .catch((err) => console.error(err));

        getTasks({ docId: docId })
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));
    }, [docId]);

    return (
        <section>
            <Header>
                <h1>Document Information</h1>

                <Button color="secondary" icon={<MdOutlineFileDownload />}>
                    Export Annotations
                </Button>
            </Header>

            <div className="docInfo">
                <p>
                    <b>ID:</b> {doc?._id}
                </p>
                <p>
                    <b>Name:</b> {doc?.name}
                </p>
                <p>
                    <b>Pages:</b> {doc?.totalPages}
                </p>
            </div>

            <hr />

            <Header>
                <h3>Document Tasks</h3>
                <Button
                    color="secondary"
                    icon={<MdAddTask />}
                    onClick={() =>
                        navigate(`/dash/tasks/new`, {
                            state: { docId: doc?._id },
                        })
                    }>
                    Create Document Task
                </Button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.description}</td>
                            <td style={{ textAlign: 'center' }}>
                                {task.pageRange.start} - {task.pageRange.end}
                            </td>
                            <td style={{ textAlign: 'center' }}>{task.status}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton
                                    title="View Task"
                                    onClick={() => navigate(`/dash/tasks/${task._id}`)}>
                                    <MdOpenInNew />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </section>
    );
};

export default DocumentPage;
