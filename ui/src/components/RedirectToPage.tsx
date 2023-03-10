import { Result, Spin } from '@allenai/varnish';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAllocatedPaperStatus } from '../api';
import { ROLES } from '../config/roles';
import { useAuth } from '../hooks';
import { CenterOnPage } from './CenterOnPage';
import ModalPopupImportDocuments from './sidebar/ModalPopupImportDocuments';

enum ViewState {
    LOADING,
    NOT_FOUND,
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
        const getFirstPaper = async () => {
            try {
                await getAllocatedPaperStatus()
                    .then((allocation) => allocation?.papers || [])
                    .then((papers) => {
                        // First available sha
                        const sha = papers.find((p) => !!p.sha)?.sha;
                        console.log(`Sha: ${sha}`);

                        if (!papers.length || !sha) {
                            setViewState(ViewState.NOT_FOUND);
                        } else {
                            setRedirectTarget(`/pdf/${sha}`);
                            setViewState(ViewState.REDIRECT);
                        }
                    });
            } catch (error) {
                console.error(error);
            }
        };

        getFirstPaper();
    }, [auth]);

    switch (viewState) {
        case ViewState.LOADING:
            return (
                <CenterOnPage>
                    <Spin size="large" />
                </CenterOnPage>
            );

        case ViewState.NOT_FOUND:
            return (
                <CenterOnPage>
                    <Result icon={<QuestionCircleOutlined />} title="PDFs Not Found" />
                    <ModalPopupImportDocuments></ModalPopupImportDocuments>
                </CenterOnPage>
            );

        case ViewState.REDIRECT:
            return <Navigate to={redirectTarget} />;
    }
};
