import { MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Header } from '../../components/common';
import { Doc, Task, useDocumentApi, useTaskApi } from '../../api';
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
        } catch (error) {
            console.log(error);
        }
        
        
    };

    return (
        <section>
            <Header>
                <h1>Task Information</h1>
                <ButtonContainer>
                    <Button
                        color="secondary"
                        icon={<MdOpenInNew />}
                        onClick={() => navigate(`/pdf-task/${task?._id}`)}>
                        Go to document annotations
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
                <label htmlFor="completed"><b>Mark as complete: {' '} </b></label>
                <input
                    id="completed"
                    type="checkbox"
                    checked={taskCompleted}
                    onChange={() => handleCheckboxStatusChange(task?._id, !taskCompleted)}
                    style={{ width: '20px', height: '20px' }}
                />
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
