import axios from 'axios';
import { JWTToken } from './schemas';

/**
 * Authorization API entry points.
 *
 * @returns API functions
 */
const useAuthApi = () => {
    /**
     * Authenticates the user with the given credentials.
     *
     * @param formData login credentials
     * @returns Promise with the JWT access token, or error
     */
    const login: (formData: FormData) => Promise<JWTToken> = async (formData: FormData) => {
        return axios
            .post('/api/auth/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Logs out the user from the application.
     */
    const logout: () => Promise<any> = async () => {
        return axios
            .get('/api/logout/', {
                withCredentials: true,
            })
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Refresh the JWT access token, using the httpOnly refresh token cookie.
     *
     * @returns Promise with the JWT access token, or error
     */
    const refresh: () => Promise<JWTToken> = async () => {
        return axios
            .get('/api/refresh/', {
                withCredentials: true,
            })
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    return { login, logout, refresh };
};

export default useAuthApi;
