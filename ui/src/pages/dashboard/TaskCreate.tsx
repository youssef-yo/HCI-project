import { MdAddTask } from 'react-icons/md';
import styled from 'styled-components';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Header, Input, InputError, InputType, Option, Table } from '../../components/common';
import { Doc, User, getApiError, useDocumentApi, useTaskApi, useUserApi, TaskExtended, TaskStatus } from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from "react-select";
import { notification } from '@allenai/varnish';

const TaskCreatePage = () => {
    const [description, setDescription] = useState<string>('');
    const [startPage, setStartPage] = useState<number>();
    const [endPage, setEndPage] = useState<number>();

    const [docOption, setDocOption] = useState<Option<Doc>>();
    const [userOption, setUserOption] = useState<Option<User>>();

    const [docOptions, setDocOptions] = useState<Option<Doc>[]>([]);
    const [userOptions, setUserOptions] = useState<Option<User>[]>([]);

    const [tasks, setTasks] = useState<TaskExtended[]>([]);
    const [selectedDocTasks, setSelectedDocTasks] = useState<TaskExtended[]>([]);

    const { getTasks } = useTaskApi();

    const { getAllDocs } = useDocumentApi();
    const { createTask } = useTaskApi();
    const { getUsers } = useUserApi();

    const location = useLocation();
    const navigate = useNavigate();

    const [errorMsgApi, setErrorMsgApi] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<any>({
        user: null,
        document: null,
        description: null,
        startPage: null, 
        endPage: null,
    });
    const errorRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        getAllDocs()
            .then((docs) => {
                const filteredDocs = docs.filter((doc) => doc.analyzed);
                
                const options = buildDocumentOptions(filteredDocs);
                setDocOptions(options);

                if (location.state?.docId) {
                    const option = options.find((o) => o.value._id === location.state.docId);
                    if (option) setDocOption(option);
                }
            })
            .catch((err) => console.error(err));


        getUsers()
            .then((users) => {
                const options = buildUserOptions(users);
                setUserOptions(options);

                if (location.state?.userId) {
                    const option = options.find((o) => o.value._id === location.state.userId);
                    if (option) setUserOption(option);
                }
            })
            .catch((err) => console.error(err));

        getTasks({})
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));    
    }, []);

    const buildDocumentOptions = (docs: Doc[]) => {
        const docOptions: Option<Doc>[] = docs.map((doc) => {
            return {
                label: doc.name,
                value: doc,
                totalPages: doc.totalPages,
                id: doc._id
            };
        });
        return docOptions;
    };

    const buildUserOptions = (users: User[]) => {
        const annotatorUsers = users.filter((user) => user.role === 'Annotator');
    
        const userOptions: Option<User>[] = annotatorUsers.map((user) => {
            return {
                label: `${user.fullName} | ${user.email}`,
                value: user,
            };
        });
    
        return userOptions;
    };

    const updateUserInput = (user: string) => {
        if (user) {
            errorMsg.user = null;
            setUserOption(user);
        }
    }

    const updateDescriptionInput = (description: string) => {
        errorMsg.description = null;
        setDescription(description);
    }

    const updateStartPageInput = (startPage: string) => {
        errorMsg.startPage = null;
        setStartPage(startPage);
    }

    const updateEndPageInput = (endPage: string) => {
        errorMsg.endPage = null;
        setEndPage(endPage);
    }

    const onCreateTask = async (e: FormEvent) => {
        e.preventDefault();

        const errors = {};

        if (!userOption) {
            errors.user = 'A user must be selected!';
            // setErrorMsg('A user must be selected!');
            // return;
        }
        if (!docOption) {
            errors.document = 'A document must be selected!';
            // setErrorMsg('A document must be selected!');
            // return;
        }
        if (description.trim().length === 0) {
            errors.description = 'A description must be specified!'
            // setErrorMsg('A description must be specified!');
            // return;
        }
        if (!startPage) {
            errors.startPage = "Starting page must be selected.";
            // setErrorMsg('Starting and ending page must be declared.');
            // return;
        }
        if (!endPage) {
            errors.endPage = 'Ending page must be selected';
        }

        setErrorMsg(errors);

        if (Object.keys(errors).length === 0) {
            const newTask = {
                userId: userOption.value._id,
                docId: docOption.value._id,
                pageRange: {
                    start: startPage,
                    end: endPage,
                },
                description: description,
            };

            createTask(newTask)
                .then((task) => {
                    navigate(`/dash/tasks/${task._id}`);
                    notification.success({
                        message: 'Task created succesfully!',
                        placement: 'bottomRight',
                    });
                })
                .catch((err) => setErrorMsgApi(getApiError(err)));
        }
    };

    const selectDoc = (docOption: any) => {
        errorMsg.document = null;
        setDocOption(docOption);
        const tasksAssociatedWithDoc = tasks.filter(task =>
            task.document._id === docOption.id && task.status === TaskStatus.ACTIVE);
        
        setSelectedDocTasks(tasksAssociatedWithDoc);
    };

    return (
        <section>
            <Header justifyContent="center">
                <h1>Create Task</h1>
            </Header>

            <Form>
                {errorMsgApi && (
                    <p className="errorMsg" ref={errorRef}>
                        {errorMsgApi}
                    </p>
                )}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '25px',
                        width:"100%"
                    }}>
                    <InputWrapper>
                    {errorMsg.user ?
                        <ErrorWrapper>
                            <Select
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        width: '100%',
                                        boxShadow: 'none',
                                        borderColor: 'red', // Imposta il colore del bordo a rosso
                                        '&:hover': {
                                            borderColor: 'red' // Anche quando si passa sopra con il mouse
                                        },
                                        '&:focus': {
                                            borderColor: 'red' // Anche quando il select è in stato di focus
                                        }
                                    }),
                                    container: base => ({
                                        ...base,
                                        flex: 1,
                                    }),
                                    singleValue: provided => ({
                                        ...provided,
                                        borderColor: 'red'
                                    })
                                }}
                                placeholder="Select User"
                                options={userOptions}
                                value={userOption}
                                onChange={(user) => updateUserInput(user)}
                                isSearchable
                            />
                            <span style={{color: "red"}}>{errorMsg.user}</span>
                        </ErrorWrapper>
                        :
                        <Select
                            styles={{
                                control: (provided) => ({ ...provided, width: '100%' }),
                                container: base => ({
                                    ...base,
                                    flex: 1
                                })
                            }}
                            placeholder="Select User"
                            options={userOptions}
                            value={userOption}
                            onChange={(user) => updateUserInput(user)}
                            isSearchable
                        />
                    }
                    {errorMsg.document ?
                        <ErrorWrapper>
                            <Select
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        width: '100%',
                                        boxShadow: 'none',
                                        borderColor: 'red', // Imposta il colore del bordo a rosso
                                        '&:hover': {
                                            borderColor: 'red' // Anche quando si passa sopra con il mouse
                                        },
                                        '&:focus': {
                                            borderColor: 'red' // Anche quando il select è in stato di focus
                                        }
                                    }),
                                    container: base => ({
                                        ...base,
                                        flex: 1,
                                    }),
                                    singleValue: provided => ({
                                        ...provided,
                                        borderColor: 'red'
                                    })
                                }}
                                placeholder="Select Document"
                                options={docOptions}
                                value={docOption}
                                onChange={(doc) => selectDoc(doc)}
                                isSearchable
                            />
                            <span style={{color: "red"}}>{errorMsg.document}</span>
                        </ErrorWrapper>
                        :
                        <Select
                            styles={{
                                control: (provided) => ({ ...provided, width: '100%' }),
                                container: base => ({
                                    ...base,
                                    flex: 1
                                })
                            }}
                            placeholder="Select Document"
                            options={docOptions}
                            value={docOption}
                            onChange={(doc) => selectDoc(doc)}
                            isSearchable
                        />
                    }
                    </InputWrapper>
                </div>
                
                <InputWrapper>
                    {errorMsg.description ?
                        <ErrorWrapperSingleComponent>
                            <InputError
                                type="text"
                                variant={InputType.STANDARD}
                                id="description"
                                placeholder="Task Description"
                                onChange={(e) => updateDescriptionInput(e.target.value)}
                                value={description}
                                width="100%"
                                required
                            />
                            <span style={{color: "red"}}>{errorMsg.description}</span>
                        </ErrorWrapperSingleComponent>
                    :
                        <Input
                            type="text"
                            variant={InputType.STANDARD}
                            id="description"
                            placeholder="Task Description"
                            onChange={(e) => updateDescriptionInput(e.target.value)}
                            value={description}
                            width="100%"
                            required
                        />
                    }
                </InputWrapper>
                
                {docOption && (
                    <InputWrapper>
                        {errorMsg.startPage ?
                            <ErrorWrapperSingleComponent>
                                <InputError
                                    type="number"
                                    min="1"
                                    max={docOption.totalPages}
                                    variant={InputType.STANDARD}
                                    id="startPage"
                                    placeholder="Start Page"
                                    onChange={(e) => updateStartPageInput(Number(e.target.value))}
                                    value={startPage}
                                    width="100%"
                                    required
                                />
                                <span style={{color: "red"}}>{errorMsg.startPage}</span>
                            </ErrorWrapperSingleComponent>
                        :
                        <Input
                            type="number"
                            min="1"
                            max={docOption.totalPages}
                            variant={InputType.STANDARD}
                            id="startPage"
                            placeholder="Start Page"
                            onChange={(e) => updateStartPageInput(Number(e.target.value))}
                            value={startPage}
                            width="100%"
                            required
                        />
                        }          
                        {errorMsg.endPage ?
                            <ErrorWrapperSingleComponent>
                                <InputError
                                    type="number"
                                    min="1"
                                    max={docOption.totalPages}
                                    variant={InputType.STANDARD}
                                    id="endPage"
                                    placeholder={`Final Page - max=${docOption.totalPages}`}
                                    onChange={(e) => updateEndPageInput(Number(e.target.value))}
                                    value={endPage}
                                    width="100%"
                                    required
                                />
                                <span style={{color: "red"}}>{errorMsg.endPage}</span>
                            </ErrorWrapperSingleComponent>
                        :
                        <Input
                            type="number"
                            min="1"
                            max={docOption.totalPages}
                            variant={InputType.STANDARD}
                            id="endPage"
                            placeholder={`Final Page - max=${docOption.totalPages}`}
                            onChange={(e) => updateEndPageInput(Number(e.target.value))}
                            value={endPage}
                            width="100%"
                            required
                        />
                        }   
                    </InputWrapper>
                )}

                <StiledButtonCreateUser
                    type="submit"
                    color="secondary"
                    size="large"
                    onClick={onCreateTask}>
                        <span className="button__icon">{<MdAddTask />}</span>
                        Create Task
                </StiledButtonCreateUser>
            </Form>
            {selectedDocTasks.length > 0 && (
                <>
                <br></br>
                    <Header>
                        <hr></hr>
                        <h5>Active Tasks already created for the selected document</h5>
                    </Header>
                    <TableWrapper>
                        
                        <Table color="#A3C4BC">
                            <thead>
                                <tr>
                                    <th>Task description</th>
                                    <th>Assigned to</th>
                                    <th>Start page</th>
                                    <th>End page</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDocTasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.description}</td>
                                        <td>{task.annotator?.email}</td>
                                        <td>{task.pageRange.start}</td>
                                        <td>{task.pageRange.end}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </>
            )}
        </section>
    );
};

export default TaskCreatePage;

const Form = styled.form`
    max-width: 80%;
    width: 80%;
    padding-left: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 25px;

    .errorMsg {
        position: relative;
        width: 100%;
        padding: 15px 7.5px;
        margin-bottom: 0;
        border: 2px solid rgba(191, 11, 11, 1);
        border-radius: 4px;
        background: rgba(191, 11, 11, 0.15);
        color: #bf3f3f;
        font-size: 0.8em;
    }
`;

const StiledButtonCreateUser = styled.button`

    width: auto;
    position: relative;
    display: inline-flex;
    align-items: center;
   
    border: none;
    outline: none;
    border-radius: 4px;

    font-weight: 600;
    line-height: 1.75;
    letter-spacing: 0.05em;
    text-transform: uppercase;

    transition: 200ms ease-out;
    cursor: pointer;

    padding: 6px 18px;
    font-size: 1em;

    background: #48CAE4;
    color: #000;

    &:hover {
        background: #ADE8F4;
    }
    
    & .button__icon {
        display: inherit;
        margin-left: -4px;
        margin-right: 8px;
    }
`;

const InputWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

const TableWrapper = styled.div`
    width: 60%;
    margin-left: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 25px;
`;

const ErrorWrapper = styled.div`
    width: 50%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
`;

const ErrorWrapperSingleComponent = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
`;
