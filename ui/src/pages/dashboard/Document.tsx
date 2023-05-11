import { notification } from '@allenai/varnish';
import { MdAddTask, MdOutlineFileDownload, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header, IconButton, Table } from '../../components/common';
import {
    Doc,
    DocCommit,
    TaskExtended,
    getApiError,
    useAnnotationApi,
    useDocumentApi,
    useTaskApi,
} from '../../api';

const DocumentPage = () => {
    const { docId } = useParams<{ docId: string }>();
    const [doc, setDoc] = useState<Doc>();
    const [tasks, setTasks] = useState<TaskExtended[]>([]);
    const [commits, setCommits] = useState<DocCommit[]>([]);

    const { exportLatestAnnotations, exportCommitAnnotations } = useAnnotationApi();
    const { getDocumentByID, getDocumentCommits } = useDocumentApi();
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

        getDocumentCommits(docId)
            .then((commits) => setCommits(commits))
            .catch((err) => console.error(err));
    }, [docId]);

    const filenameFromResponse = (response: any) => {
        const headerval = response.headers['content-disposition'];
        return headerval.split(';')[1].split('=')[1].replace('"', '').replace('"', '');
    };

    const downloadAnnotations = (commitId?: string) => {
        if (!docId) return;

        let download;
        if (commitId) {
            download = () => exportCommitAnnotations(docId, commitId);
        } else {
            download = () => exportLatestAnnotations(docId);
        }

        download()
            .then((res) => {
                console.log('DATA:', res);
                const url = URL.createObjectURL(new Blob([res.data]));
                const fileName = filenameFromResponse(res);

                const aTag = document.createElement('a');
                aTag.href = url;
                aTag.setAttribute('download', fileName);

                document.body.appendChild(aTag);
                aTag.click();
                aTag.remove();

                URL.revokeObjectURL(url);
            })
            .catch((err) =>
                notification.error({
                    message: 'Error downloading annotations!',
                    description: getApiError(err),
                })
            );
    };

    return (
        <section>
            <Header>
                <h1>Document Information</h1>

                <Button
                    color="secondary"
                    icon={<MdOutlineFileDownload />}
                    onClick={() => downloadAnnotations()}>
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
                        <th>Annotator</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.annotator?.email}</td>
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

            <hr />

            <Header>
                <h3>Document Commits</h3>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {commits.map((commit) => (
                        <tr key={commit._id}>
                            <td>{commit._id}</td>
                            <td>{new Date(commit.createdAt).toUTCString()}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton
                                    title="View Commit"
                                    onClick={() => navigate(`/pdf-commit/${commit._id}`)}>
                                    <MdOpenInNew />
                                </IconButton>
                                <IconButton
                                    title="Export Commit Annotations"
                                    onClick={() => downloadAnnotations(commit._id)}>
                                    <MdOutlineFileDownload />
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
