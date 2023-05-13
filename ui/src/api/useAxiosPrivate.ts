import { useEffect } from 'react';
import { axiosPrivate } from '.';
import useAuth from '../hooks/useAuth';
import useRefreshToken from '../hooks/useRefreshToken';

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { token } = useAuth();

    useEffect(() => {
        /**
         * Intercepts the incoming request and adds to the request header
         * the authorization JWT token.
         */
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        /**
         * Intercepts the incoming response.
         * If the response was successful, it just passes along the response.
         * If the response was unsuccessful, it refreshes the token and retries the request.
         */
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;

                // Status 403 == Forbidden
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [token, refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;
