import { MdLogin } from 'react-icons/md';
import { useRef, useState, useEffect, FormEvent } from 'react';
import styled from 'styled-components';

import { getApiError, useAuthApi } from '../api';
import { useAuth } from '../hooks';
import { Button, Input, InputType } from '../components/common';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { login } = useAuthApi();
    const { setToken } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const errorRef = useRef<HTMLParagraphElement>(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setErrorMsg('');
    }, [username, password]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (username.trim().length === 0 || password.trim().length === 0) {
            setErrorMsg('Both username and password must be provided!');
            return;
        }

        const formData = new FormData();
        formData.set('username', username);
        formData.set('password', password);

        login(formData)
            .then((res) => {
                setToken(res.accessToken);
                setUsername('');
                setPassword('');
                navigate(from, { replace: true });
            })
            .catch((err) => setErrorMsg(getApiError(err)));
    };

    return (
        <Section>
            <div className="container">
                <div className="content">
                    <p className="navGroup__title">
                        ONTO-PAWLS
                    </p>

                    <Form onSubmit={handleSubmit}>
                        {errorMsg && (
                            <p className="errorMsg" ref={errorRef}>
                                {errorMsg}
                            </p>
                        )}

                        <Input
                            style={{ border: '1px solid black' }}
                            type="text"
                            variant={InputType.STANDARD}
                            width="100%"
                            id="username"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            required
                        />

                        <Input
                            style={{ border: '1px solid black' }}
                            type="password"
                            variant={InputType.STANDARD}
                            width="100%"
                            id="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />

                        <Button
                            style={{ border: '1px solid black' }}
                            color="login"
                            icon={<MdLogin />}
                            size="large"
                            onClick={handleSubmit}>
                            Login
                        </Button>
                    </Form>
                </div>
            </div>
        </Section>
    );
};

export default LoginPage;

const Section = styled.section`
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, lightblue, rgba(2, 62, 138, 0.7)); /* Example gradient */
    backdrop-filter: blur(10px);

    .container {
        border: 1px solid black;
        position: relative;
        width: 400px;
        background: rgba(2, 62, 138, 0.8);
        border-radius: 8px;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    }

    .content {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 20px; /* Adjust gap as needed */
    }

    .navGroup__title {
        color: #FFFFFF;
        margin: 0 0 0 0;
        font-size: 3.0rem;
        text-transform: uppercase;
    }
`;

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
        border: 2px solid #FF4C4C;
        border-radius: 4px;
        background: rgba(255, 76, 76, 0.15);
        color: #FF4C4C;
        font-size: 0.8em;
    }
`;
