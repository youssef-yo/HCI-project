import axios, { AxiosError, AxiosInstance } from 'axios';

export const axiosPrivate: AxiosInstance = axios.create({
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Necessary to send Authorization JWT token
});

export const getApiError: (error: Error | AxiosError) => string = (error: Error | AxiosError) => {
    if (axios.isAxiosError(error)) {
        if (!error.response) return 'Server Unavailable.';
        if (error.response?.data?.detail) return error.response.data.detail;
    }

    return 'Something went wrong...';
};
