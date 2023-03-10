import axios, { AxiosInstance } from 'axios';

export const axiosPrivate: AxiosInstance = axios.create({
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Necessary to send Authorization JWT token
});
