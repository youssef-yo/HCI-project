import { useAuthApi } from '../api';
import useAuth from './useAuth';

const useLogout = () => {
    const { logout } = useAuthApi();
    const { setAuth, setToken } = useAuth();

    const logoutUser = async () => {
        setAuth(null);
        setToken(null);

        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    };

    return logoutUser;
};

export default useLogout;
