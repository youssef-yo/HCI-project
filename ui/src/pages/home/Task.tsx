import { MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header } from '../../components/common';
import { Doc, Task, useDocumentApi, useTaskApi } from '../../api';

const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const [task, setTask] = useState<Task>();
    const [doc, setDoc] = useState<Doc>();

    const { getTaskByID } = useTaskApi();
    const { getDocumentByID } = useDocumentApi();
    const navigate = useNavigate();

    const loadDocument = (docId: string) => {
        getDocumentByID(docId)
            .then((doc) => setDoc(doc))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (!taskId) {
            // TODO
            console.error('No task has been selected!');
            return;
        }

        getTaskByID(taskId)
            .then((task) => {
                setTask(task);
                loadDocument(task.docId);
            })
            .catch((err) => console.error(err));
    }, [taskId]);

    return (
        <section>
            <Header>
                <h1>Task Information</h1>
                <Button
                    color="secondary"
                    icon={<MdOpenInNew />}
                    onClick={() => navigate(`/pdf-task/${task?._id}`)}>
                    Go to document annotations
                </Button>
            </Header>

            <div className="taskInfo">
                <h3>Task</h3>
                <p>
                    <b>ID:</b> {task?._id}
                </p>
                <p>
                    <b>Pages:</b> {task?.pageRange.start} - {task?.pageRange.end}
                </p>
                <p>
                    <b>Description:</b> {task?.description}
                </p>
                <p>
                    <b>Status:</b> {task?.status}
                </p>
                <p>
                    <b>Marked as complete:</b> {task?.markedComplete ? 'True' : 'False'}
                </p>
            </div>

            <hr />

            <div className="docInfo">
                <h3>Document</h3>
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
        </section>
    );
};

export default TaskPage;
