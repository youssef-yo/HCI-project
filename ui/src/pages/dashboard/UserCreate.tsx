import { MdOutlinePersonAddAlt } from 'react-icons/md';
import styled from 'styled-components';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserApi } from '../../api';
import { Button, Header, Input, InputType, Option, Select } from '../../components/common';
import { ROLES } from '../../config/roles';

const UserCreatePage = () => {
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [roleOption, setRoleOption] = useState<Option<string>>();

    const [roleOptions, setRoleOptions] = useState<Option<string>[]>([]);

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    const navigate = useNavigate();
    const { createUser } = useUserApi();

    useEffect(() => {
        const options = buildRoleOptions([ROLES.Admin, ROLES.Annotator]);
        setRoleOptions(options);
    }, []);

    const buildRoleOptions = (roles: string[]) => {
        const roleOptions: Option<string>[] = roles.map((role) => {
            return {
                label: role,
                value: role,
            };
        });
        return roleOptions;
    };

    const onCreateUser = async (e: FormEvent) => {
        e.preventDefault();

        if (email.trim().length === 0) {
            setErrorMsg('An email must be specified!');
            return;
        }
        if (fullName.trim().length === 0) {
            setErrorMsg('The user name must be specified!');
            return;
        }
        if (!roleOption) {
            setErrorMsg('A user role must be selected!');
            return;
        }
        if (password.trim().length === 0) {
            setErrorMsg('A password must be specified!');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords must match!');
            return;
        }

        const newUser = {
            email: email,
            fullName: fullName,
            password: password,
            role: roleOption.value,
        };

        createUser(newUser)
            .then((user) => {
                console.log(`User ${user.email} successfully created!`);
                navigate(`/dash/users/${user._id}`);
            })
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else if (err.response?.status === 409) {
                    setErrorMsg('Another user with the same email already exists.');
                } else {
                    setErrorMsg('Something went wrong...');
                }
            });
    };

    return (
        <section>
            <Header>
                <h1>User Form</h1>
            </Header>

            <Form onSubmit={(e) => onCreateUser(e)}>
                {errorMsg && (
                    <p className="errorMsg" ref={errorRef}>
                        {errorMsg}
                    </p>
                )}

                <Input
                    type="text"
                    variant={InputType.STANDARD}
                    id="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />

                <Input
                    type="text"
                    variant={InputType.STANDARD}
                    id="fullName"
                    placeholder="Full Name"
                    onChange={(e) => setFullName(e.target.value)}
                    value={fullName}
                    required
                />

                <Select
                    placeHolder="Select Role"
                    options={roleOptions}
                    value={roleOption}
                    onChange={(role) => setRoleOption(role)}
                    isSearchable
                />

                <Input
                    type="password"
                    variant={InputType.STANDARD}
                    id="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />

                <Input
                    type="password"
                    variant={InputType.STANDARD}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    required
                />

                <Button
                    type="submit"
                    color="secondary"
                    icon={<MdOutlinePersonAddAlt />}
                    size="large"
                    onClick={onCreateUser}>
                    Create User
                </Button>
            </Form>
        </section>
    );
};

export default UserCreatePage;

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
