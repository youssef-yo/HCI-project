import { MdAddTask } from 'react-icons/md';
import styled from 'styled-components';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button, Header, Input, InputType, Option, Select } from '../../components/common';
import { Doc, User, getApiError, useDocumentApi, useTaskApi, useUserApi } from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';

const TaskCreatePage = () => {
    const [description, setDescription] = useState<string>('');
    const [startPage, setStartPage] = useState<number>();
    const [endPage, setEndPage] = useState<number>();

    const [docOption, setDocOption] = useState<Option<Doc>>();
    const [userOption, setUserOption] = useState<Option<User>>();

    const [docOptions, setDocOptions] = useState<Option<Doc>[]>([]);
    const [userOptions, setUserOptions] = useState<Option<User>[]>([]);

    const { getAllDocs } = useDocumentApi();
    const { createTask } = useTaskApi();
    const { getUsers } = useUserApi();

    const location = useLocation();
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        getAllDocs()
            .then((docs) => {
                const options = buildDocumentOptions(docs);
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
    }, []);

    const buildDocumentOptions = (docs: Doc[]) => {
        const docOptions: Option<Doc>[] = docs.map((doc) => {
            return {
                label: doc.name,
                value: doc,
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

    const onCreateTask = async (e: FormEvent) => {
        e.preventDefault();

        if (!userOption) {
            setErrorMsg('A user must be selected!');
            return;
        }
        if (!docOption) {
            setErrorMsg('A document must be selected!');
            return;
        }
        if (description.trim().length === 0) {
            setErrorMsg('A description must be specified!');
            return;
        }
        if (!startPage || !endPage) {
            setErrorMsg('Starting and ending page must be declared.');
            return;
        }

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
                console.log(`Task ${task._id} successfully created.`);
                navigate(`/dash/tasks/${task._id}`);
            })
            .catch((err) => setErrorMsg(getApiError(err)));
    };

    return (
        <section>
            <Header>
                <h1>Task Form</h1>
            </Header>

            <Form>
                {errorMsg && (
                    <p className="errorMsg" ref={errorRef}>
                        {errorMsg}
                    </p>
                )}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '25px',
                    }}>
                    <Select
                        style={{ flex: 1 }}
                        placeHolder="Select User"
                        options={userOptions}
                        value={userOption}
                        onChange={(user) => setUserOption(user)}
                        isSearchable
                    />
                    <Select
                        style={{ flex: 1 }}
                        placeHolder="Select Document"
                        options={docOptions}
                        value={docOption}
                        onChange={(doc) => setDocOption(doc)}
                        isSearchable
                    />
                </div>

                <Input
                    type="text"
                    variant={InputType.STANDARD}
                    id="description"
                    placeholder="Task Description"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    required
                />

                <Input
                    type="number"
                    variant={InputType.STANDARD}
                    id="startPage"
                    placeholder="Start Page"
                    onChange={(e) => setStartPage(Number(e.target.value))}
                    value={startPage}
                    required
                />

                <Input
                    type="number"
                    variant={InputType.STANDARD}
                    id="endPage"
                    placeholder="Final Page"
                    onChange={(e) => setEndPage(Number(e.target.value))}
                    value={endPage}
                    required
                />

                <Button
                    type="submit"
                    color="secondary"
                    icon={<MdAddTask />}
                    size="large"
                    onClick={onCreateTask}>
                    Create Task
                </Button>
            </Form>
        </section>
    );
};

export default TaskCreatePage;

const Form = styled.form`
    width: 100%;
    display: flex;
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
