import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/common';
import { Doc, Task, User, useDocumentApi, useTaskApi, useUserApi } from '../../api';

const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const [task, setTask] = useState<Task>();
    const [doc, setDoc] = useState<Doc>();
    const [user, setUser] = useState<User>();

    const { getTaskByID } = useTaskApi();
    const { getDocumentByID } = useDocumentApi();
    const { getUserByID } = useUserApi();

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

    return (
        <section>
            <Header>
                <h1>Task Information</h1>
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
