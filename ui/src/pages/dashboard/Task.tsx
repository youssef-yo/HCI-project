import { MdDeleteOutline, MdMergeType, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header } from '../../components/common';
import {
    Doc,
    Task,
    TaskStatus,
    User,
    getApiError,
    useDocumentApi,
    useTaskApi,
    useUserApi,
} from '../../api';
import { useDialog } from '../../hooks';
import { notification } from '@allenai/varnish';

const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const [task, setTask] = useState<Task>();
    const [doc, setDoc] = useState<Doc>();
    const [user, setUser] = useState<User>();

    const { commitTask, dismissTask, getTaskByID } = useTaskApi();
    const { getDocumentByID } = useDocumentApi();
    const { getUserByID } = useUserApi();

    const dialog = useDialog();
    const navigate = useNavigate();

    const loadDocument = (docId: string) => {
        getDocumentByID(docId)
            .then((doc) => setDoc(doc))
            .catch((err) => console.error(err));
    };

    const loadUser = (userId: string) => {
        getUserByID(userId)
            .then((user) => setUser(user))
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
                loadUser(task.userId);
            })
            .catch((err) => console.error(err));
    }, [taskId]);

    const onCommitTask = async () => {
        const confirm = await dialog.showConfirmation(
            'Committing Task',
            <div>
                <p>Are you sure you want to commit the selected task annotations?</p>
                <p>
                    By doing so, all the changes that have been applied by the annotator in this
                    task will be merged with the annotations of the previous commit.
                </p>
                <p>
                    <b>This action cannot be undone!</b>
                </p>
            </div>
        );
        if (!confirm) return;

        commitTask(task!!._id)
            .then((_) => window.location.reload())
            .catch((err) =>
                notification.error({
                    message: 'Could not commit task!',
                    description: getApiError(err),
                })
            );
    };

    const onDismissTask = async () => {
        const confirm = await dialog.showConfirmation(
            'Dismissing Task',
            <div>
                <p>Are you sure you want to dismiss the selected task annotations?</p>
                <p>
                    By doing so, all the changes that have been applied by the annotator in this
                    task will be discarded, and all the pages allocated to this task will be
                    available again for future tasks.
                </p>
                <p>
                    <b>This action cannot be undone!</b>
                </p>
            </div>
        );
        if (!confirm) return;

        dismissTask(task!!._id)
            .then((_) => window.location.reload())
            .catch((err) =>
                notification.error({
                    message: 'Could not dismiss task!',
                    description: getApiError(err),
                })
            );
    };

    return (
        <section>
            <Header>
                <h1>Task Information</h1>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                    }}>
                    {task?.status === TaskStatus.ACTIVE && (
                        <Button
                            color="secondary"
                            icon={<MdDeleteOutline />}
                            onClick={onDismissTask}>
                            Dismiss
                        </Button>
                    )}
                    {task?.status === TaskStatus.ACTIVE && (
                        <Button color="secondary" icon={<MdMergeType />} onClick={onCommitTask}>
                            Commit
                        </Button>
                    )}
                    <Button
                        color="secondary"
                        icon={<MdOpenInNew />}
                        onClick={() => navigate(`/pdf-task/${task?._id}`)}>
                        View document annotations
                    </Button>
                </div>
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
                    <b>Marked by annotator as complete:</b>{' '}
                    {task?.markedComplete ? 'True' : 'False'}
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

            <hr />

            <div className="userInfo">
                <h3>User</h3>
                <p>
                    <b>ID:</b> {user?._id}
                </p>
                <p>
                    <b>Email:</b> {user?.email}
                </p>
                <p>
                    <b>Full Name:</b> {user?.fullName}
                </p>
            </div>
        </section>
    );
};

export default TaskPage;
