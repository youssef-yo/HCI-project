import { MdOutlinePersonAddAlt } from 'react-icons/md';
import styled from 'styled-components';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiError, useUserApi } from '../../api';
import { Header, Input, InputError, InputType, Option } from '../../components/common';
import ChooseTypeUser from '../../components/common/ChooseTypeUser';
import { ROLES } from '../../config/roles';
import { notification } from '@allenai/varnish';

const UserCreatePage = () => {
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [roleOption, setRoleOption] = useState<Option<string>>();

    const [roleOptions, setRoleOptions] = useState<Option<string>[]>([]);

    const [errorMsgApi, setErrorMsgApi] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<any>({
        email: null,
        user: null,
        password: null,
        confirmPassword: null, 
    });
    
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

        const errors = {};

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (email.trim().length === 0) {
            errors.email = "An email must be specified!";
            // setErrorMsg('Use a valid email!');
            // return;
        } else if (!isValidEmail) {
            errors.email = "Use a valid email!";
            // setErrorMsg('An email must be specified!');
            // return;
        } 
        if (fullName.trim().length === 0) {
            errors.user = "The user name must be specified!";
            // setErrorMsg('The user name must be specified!');
            // return;
        }
        if (!roleOption) {
            notification.warning({
                message: 'A role must be selected.',
                placement: 'bottomRight',
            })    
            // setErrorMsg('A user role must be selected!');
            // return;
        }
        if (password.trim().length === 0) {
            errors.password = "A password must be specified!";
            // setErrorMsg('A password must be specified!');
            // return;
        } 

        if (confirmPassword.trim().length === 0) {
            errors.confirmPassword = "A password must be specified!";
        }
        
        if (password !== confirmPassword) {
            errors.password = "Password must match!";
            errors.confirmPassword = "Password must match!";
            // setErrorMsg('Passwords must match!');
            // return;
        }

        if (password.length < 4 || password.length > 12) {
            errors.password = "Password must be between 4 and 12 characters.";
            // setErrorMsg('Password must be between 4 and 12 characters.');
            // return;
        }

        if (confirmPassword.length < 4 || confirmPassword.length > 12) {
            errors.confirmPassword = "Password must be between 4 and 12 characters.";
            // setErrorMsg('Password must be between 4 and 12 characters.');
            // return;
        }

        setErrorMsg(errors);

        if (Object.keys(errors).length === 0) {
            const newUser = {
                email: email,
                fullName: fullName,
                password: password,
                role: roleOption.value,
            };
    
            createUser(newUser)
                .then((user) => {
                    navigate(`/dash/users/${user._id}`);
                    notification.success({
                        message: 'User created succesfully!',
                        placement: 'bottomRight',
                    });    
                })
                .catch((err) => setErrorMsgApi(getApiError(err)));
        }
    };
    
    return (
        <section>
            <Header justifyContent="center">
                <h1>Create user</h1>
            </Header>
        
            <Form onSubmit={(e) => onCreateUser(e)}>
                {errorMsgApi && (
                    <p className="errorMsg" ref={errorRef}>
                        {errorMsgApi}
                    </p>
                )}

                <InputWrapper>
                    {errorMsg.user ?
                        <ErrorWrapper>
                            <InputError
                                color="#000000"
                                type="text"
                                variant={InputType.STANDARD}
                                id="fullName"
                                placeholder="Full Name"
                                width="100%"
                                onChange={(e) => setFullName(e.target.value)}
                                value={fullName}
                                required
                            />
                            <span style={{color: "red"}}>{errorMsg.user}</span>
                        </ErrorWrapper>
                        :
                        <Input
                            color="#000000"
                            type="text"
                            variant={InputType.STANDARD}
                            id="fullName"
                            placeholder="Full Name"
                            width="100%"
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                            required
                        />
                    }
                    {errorMsg.email ?
                        <ErrorWrapper>
                            <InputError
                                color="#000000"
                                type="text"
                                variant={InputType.STANDARD}
                                id="email"
                                placeholder="Email"
                                width="100%"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                            />
                            <span style={{color: "red"}}>{errorMsg.email}</span>
                        </ErrorWrapper>
                        :
                        <Input
                            color="#000000"
                            type="text"
                            variant={InputType.STANDARD}
                            id="email"
                            placeholder="Email"
                            width="100%"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                    }
                </InputWrapper>

                <InputWrapper>
                {errorMsg.password ?
                        <ErrorWrapper>
                            <InputError
                                color="#000000"
                                type="password"
                                pattern=".{4,12}"
                                minlength="4"
                                variant={InputType.STANDARD}
                                id="password"
                                placeholder="Password"
                                width="100%"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                            <span style={{color: "red"}}>{errorMsg.password}</span>
                        </ErrorWrapper>
                        :
                        <div style={{ width: "100%" }}>
                            <Input
                                color="#000000"
                                type="password"
                                pattern=".{4,12}"
                                minlength="4"
                                variant={InputType.STANDARD}
                                id="password"
                                placeholder="Password"
                                width="100%"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                            <PasswordConstraints>
                                Your password needs to be between 4 and 12 characters.
                            </PasswordConstraints>
                        </div>
                    }

                    {errorMsg.confirmPassword ?
                        <ErrorWrapper>
                            <InputError
                                color="#000000"
                                type="password"
                                pattern=".{4,12}"
                                variant={InputType.STANDARD}
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                width="100%"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                required
                            />
                            <span style={{color: "red"}}>{errorMsg.confirmPassword}</span>
                        </ErrorWrapper>
                        :
                        <div style={{ width: "100%" }}>
                            <Input
                                color="#000000"
                                type="password"
                                pattern=".{4,12}"
                                variant={InputType.STANDARD}
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                width="100%"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                required
                            />
                            <PasswordConstraints>
                                Your password needs to be between 4 and 12 characters.
                            </PasswordConstraints>  
                        </div>
                    }                        
                </InputWrapper>
                
                {/* <Select
                    placeHolder="Select Role"
                    options={roleOptions}
                    value={roleOption}
                    onChange={(role) => setRoleOption(role)}
                    isSearchable
                /> */}
                <ChooseTypeUser
                    options={roleOptions}
                    onChange={(role) => setRoleOption(role)}
                />
                <StiledButtonCreateUser
                    type="submit"
                    size="medium"
                    onClick={onCreateUser}>
                        <span className="button__icon">{<MdOutlinePersonAddAlt />}</span>
                        Create User
                </StiledButtonCreateUser>
                

                
            </Form>
        </section>
    );
};

export default UserCreatePage;


const StiledButtonCreateUser = styled.button`

    width: 20%;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
   
    border: none;
    outline: none;
    border-radius: 4px;

    font-weight: 600;
    line-height: 1.75;
    letter-spacing: 0.05em;
    text-transform: uppercase;

    transition: 200ms ease-out;
    cursor: pointer;

    padding: 0.75em 1.5em;
    font-size: 0.9em;

    background: #48CAE4;
    color: #000;

    &:hover {
        background: #ADE8F4;
    }
    
    & .button__icon {
        display: inherit;
        margin-left: -0.25em;
        margin-right: 0.5em;
    }

    span {
        max-width: calc(100% - 1.5em);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media screen and (max-width: 768px) {
        padding: 4px 12px;
        font-size: 0.9em;
    }
    
    @media screen and (max-width: 480px) {
        padding: 3px 10px;
        font-size: 0.8em;
    }
`;

const InputWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px; // Spazio tra gli input
`;

const ErrorWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
`;

const Form = styled.form`

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

const PasswordConstraints = styled.div`
    text-align: left;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #777;
`;
