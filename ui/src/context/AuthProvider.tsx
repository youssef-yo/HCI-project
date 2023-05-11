import React, { createContext, ReactNode, useEffect, useState } from 'react';
import jwtdecode from 'jwt-decode';
import { JWTTokenData } from '../api';

export type AuthData = {
    id: string;
    username: string;
    role: string;
};

type AuthProviderProps = {
    children: ReactNode;
};

type AuthContextProps = {
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    auth: AuthData | null;
    setAuth: React.Dispatch<React.SetStateAction<AuthData | null>>;
};

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [auth, setAuth] = useState<AuthData | null>(null);

    useEffect(() => {
        // console.log(`Token: ${token}`);
        if (!token) return;

        const decoded: JWTTokenData = jwtdecode(token);
        const { _id, username, role } = decoded.userInfo;

        // console.log(`Username: ${username}`);
        // console.log(`Role: ${role}`);

        setAuth({ id: _id, username, role });
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
