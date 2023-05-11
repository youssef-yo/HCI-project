import { MdLogin } from 'react-icons/md';
import { useRef, useState, useEffect, FormEvent } from 'react';
import styled from 'styled-components';
import pawlsLogo from '../assets/images/pawlsLogo.png';

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
            {Array.from({ length: 200 }, (_, i) => (
                <span key={i} className="bg-square"></span>
            ))}

            <div className="container">
                <div className="content">
                    <img src={pawlsLogo} />

                    <Form onSubmit={handleSubmit}>
                        {errorMsg && (
                            <p className="errorMsg" ref={errorRef}>
                                {errorMsg}
                            </p>
                        )}

                        <Input
                            type="text"
                            variant={InputType.STANDARD}
                            id="username"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
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

                        <Button
                            color="primary"
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
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2px;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(#fff, #bf0b0b, #fff);
        animation: animate 5s linear infinite;
    }

    @keyframes animate {
        0% {
            transform: translateY(-100%);
        }
        100% {
            transform: translateY(100%);
        }
    }

    .bg-square {
        position: relative;
        display: block;
        width: calc(6.25vw - 2px);
        height: calc(6.25vw - 2px);
        background: #b3b3b3;
        z-index: 2;
    }

    @media (max-width: 900px) {
        .bg-square {
            width: calc(10vw - 2px);
            height: calc(10vw - 2px);
        }
    }
    @media (max-width: 600px) {
        .bg-square {
            width: calc(20vw - 2px);
            height: calc(20vw - 2px);
        }
    }

    .container {
        position: absolute;
        width: 400px;
        background: #222;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        border-radius: 4px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    }

    .content {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 40px;
    }

    .content img {
        max-width: 80%;
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
        border: 2px solid rgba(191, 11, 11, 1);
        border-radius: 4px;
        background: rgba(191, 11, 11, 0.15);
        color: #bf3f3f;
        font-size: 0.8em;
    }
`;
