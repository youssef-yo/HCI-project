import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, useUserApi } from '../../api';
import { Header } from '../../components/common';

const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User>();
    const { getUserByID } = useUserApi();

    useEffect(() => {
        if (!userId) {
            // TODO
            console.error('No user has been selected!');
            return;
        }

        getUserByID(userId)
            .then((user) => setUser(user))
            .catch((_) => console.error('User not found!'));
    }, [userId]);

    return (
        <section>
            <Header>
                <h1>User Information</h1>
            </Header>

            <div className="userInfo">
                <p>
                    <b>ID:</b> {user?._id}
                </p>
                <p>
                    <b>Email:</b> {user?.email}
                </p>
                <p>
                    <b>Full Name:</b> {user?.fullName}
                </p>
                <p>
                    <b>Role:</b> {user?.role}
                </p>
            </div>
        </section>
    );
};

export default UserPage;
