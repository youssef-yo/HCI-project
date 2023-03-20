import { useAuthApi } from '../api';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { refresh } = useAuthApi();
    const { setToken } = useAuth();

    const refreshToken = async () => {
        try {
            const res = await refresh();
            setToken(res.accessToken);
            return res.accessToken;
        } catch (err) {
            Promise.reject(err);
        }
    };

    return refreshToken;
};

export default useRefreshToken;
