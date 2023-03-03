import { createContext, ReactNode, useState } from 'react';

export type AuthData = {
    role: string;
    username: string; // Email of the user currently logged in
    accessToken: string; // JWT token received when logged in
};

type AuthProviderProps = {
    children: ReactNode;
};

type AuthContextProps = {
    auth: AuthData;
    setAuth: (authData: AuthData) => void;
};

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState<AuthData>({
        role: '',
        username: '',
        accessToken: '',
    });

    return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};
