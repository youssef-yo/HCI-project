import { Spin } from '@allenai/varnish';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../config/roles';
import { useAuth } from '../hooks';
import { CenterOnPage } from './CenterOnPage';

enum ViewState {
    LOADING,
    REDIRECT,
}

export const RedirectToPage = () => {
    const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING);
    const [redirectTarget, setRedirectTarget] = useState<string>('/');
    const { auth } = useAuth();

    useEffect(() => {
        setViewState(ViewState.LOADING);

        // User has not logged in
        if (!auth) {
            setRedirectTarget('/login');
            setViewState(ViewState.REDIRECT);
            return;
        }

        // User is an administrator
        if (auth.role === ROLES.Admin) {
            setRedirectTarget('/dash');
            setViewState(ViewState.REDIRECT);
            return;
        }

        // User must be an annotator at this point
        setRedirectTarget('/home');
        setViewState(ViewState.REDIRECT);
    }, [auth]);

    switch (viewState) {
        case ViewState.LOADING:
            return (
                <CenterOnPage>
                    <Spin size="large" />
                </CenterOnPage>
            );

        case ViewState.REDIRECT:
            return <Navigate to={redirectTarget} />;
    }
};
