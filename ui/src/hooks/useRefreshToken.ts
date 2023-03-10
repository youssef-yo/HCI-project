import { refresh } from '../api';
import { useAuth } from './useAuth';

export const useRefreshToken = () => {
    const { setToken } = useAuth();

    const refreshToken = async () => {
        await refresh()
            .then((res) => {
                console.log(res);
                setToken(res.accessToken);
            })
            .catch((err) => {
                console.log(err.response);
                Promise.reject(err);
            });
    };

    return refreshToken;
};
