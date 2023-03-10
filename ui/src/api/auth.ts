import axios from 'axios';
import { JWTToken } from './schemas';

/**
 * Authenticates the user with the given credentials.
 *
 * @param formData login credentials
 * @returns Promise with the JWT access token, or error
 */
export async function login(formData: FormData): Promise<JWTToken> {
    return axios
        .post('/api/auth/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((res) => res.data)
        .catch((err) => Promise.reject(err));
}

/**
 * Refresh the JWT access token, using the httpOnly refresh token cookie.
 *
 * @returns Promise with the JWT access token, or error
 */
export async function refresh(): Promise<JWTToken> {
    return axios
        .get('/api/refresh/', {
            withCredentials: true,
        })
        .then((res) => res.data)
        .catch((err) => Promise.reject(err));
}
