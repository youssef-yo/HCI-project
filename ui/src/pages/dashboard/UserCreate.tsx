import { FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserApi } from '../../api';
import { Button, Header, Input, InputType } from '../../components/common';

const UserCreatePage = () => {
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [role, setRole] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    const navigate = useNavigate();
    const { createUser } = useUserApi();

    const onCreateUser = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMsg('Passwords must match!');
            return;
        }

        const newUser = {
            email: email,
            fullName: fullName,
            password: password,
            role: role,
        };

        createUser(newUser)
            .then((user) => {
                console.log(`User ${user.email} successfully created!`);
                navigate(`/dash/users/info/${user._id}`);
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

                <Input
                    type="text"
                    variant={InputType.STANDARD}
                    id="role"
                    placeholder="Role"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                    required
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

                <Button type="submit" color="secondary" size="large" onClick={onCreateUser}>
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
