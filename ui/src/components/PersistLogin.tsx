import { Spin } from '@allenai/varnish';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CenterOnPage } from '.';
import { useAuth, useRefreshToken } from '../hooks';

export const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const refresh = useRefreshToken();
    const { token } = useAuth();

    useEffect(() => {
        const isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (error) {
                console.error(error);
            } finally {
                isMounted && setIsLoading(false);
            }
        };

        !token ? verifyRefreshToken() : setIsLoading(false);
    }, []);

    return isLoading ? (
        <CenterOnPage>
            <Spin size="large" />
        </CenterOnPage>
    ) : (
        <Outlet />
    );
};
