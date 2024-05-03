import { MdOpenInNew, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header } from '../../components/common';
import { Doc, Task, TaskStatus, useDocumentApi, useTaskApi } from '../../api';
import { notification } from '@allenai/varnish';
import styled from 'styled-components';

const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const [task, setTask] = useState<Task>();
    const [doc, setDoc] = useState<Doc>();
    const [taskCompleted, setTaskCompleted] = useState(task?.markedComplete || false);


    const { getTaskByID, markTaskComplete } = useTaskApi();
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
                setTaskCompleted(task.markedComplete);
                loadDocument(task.docId);
            })
            .catch((err) => console.error(err));
        
    }, [taskId]);

    const handleCheckboxStatusChange = (id: string, completed: boolean) => {
        try {
            markTaskComplete(id, completed);
            setTaskCompleted(completed);
            if (completed) {
                notification.success({
                    message: 'Task marked as completed!',
                    placement: 'bottomRight',
                });
            } else {
                notification.success({
                    message: 'Task now is open!',
                    placement: 'bottomRight',
                });
            }
        } catch (error) {
            console.log(error);
        }
        
        
    };

    return (
        <section>
            <Header>
                <h1>Task Information</h1>
                <ButtonContainer>
                {task && task.status === TaskStatus.ACTIVE ? (
                    taskCompleted ? (
                        <Button
                            color="edit"
                            icon={<MdLockOpen />}
                            onClick={() =>  handleCheckboxStatusChange(task?._id, !taskCompleted)}>
                            Re-open task
                        </Button>
                    ) : (
                        <Button
                            color="commit"
                            icon={<MdLockOutline />}
                            onClick={() =>  handleCheckboxStatusChange(task?._id, !taskCompleted)}>
                            Complete task
                        </Button>
                    )
                ) : null}
                    
                    <Button
                        color="secondary"
                        icon={<MdOpenInNew />}
                        onClick={() => navigate(`/pdf-task/${task?._id}`)}>
                        {task && task.status === TaskStatus.ACTIVE ? 
                            <>Annotate</>
                        :
                            <>Go to document annotations</>
                        }
                        
                    </Button>
                </ButtonContainer>
            </Header>

            <div className="taskInfo">
                <h3>Task</h3>
                <p>
                    <b>Pages:</b> {task?.pageRange.start} - {task?.pageRange.end}
                </p>
                <p>
                    <b>Description:</b> {task?.description}
                </p>
                <p>
                    <b>Status:</b> {task?.status}
                </p>
            </div>

            <hr />

            <div className="docInfo">
                <h3>Document</h3>
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

const ButtonContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px; 
`;
