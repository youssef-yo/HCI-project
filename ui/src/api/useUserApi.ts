import { User, UserCreate } from './schemas';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Users API entry points.
 *
 * @returns API functions
 */
const useUserApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Gets all the users.
     *
     * @returns Promise with users
     */
    const getUsers: () => Promise<User[]> = () => {
        return axiosPrivate
            .get('/api/users')
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets a specific user, based on the given identifier.
     *
     * @param id User identifier
     * @returns Promise with user
     */
    const getUserByID: (id: string) => Promise<User> = (id: string) => {
        return axiosPrivate
            .get(`/api/users/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Creates a new user.
     *
     * @param user User to create
     * @returns Promise with user
     */
    const createUser: (user: UserCreate) => Promise<User> = (user: UserCreate) => {
        return axiosPrivate
            .post(`/api/users`, user)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    return { getUsers, getUserByID, createUser };
};

export default useUserApi;
