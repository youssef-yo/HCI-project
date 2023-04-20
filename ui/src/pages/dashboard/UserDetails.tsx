import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, useUserApi } from '../../api';
import { Header } from '../../components/common';

const UserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User>();
    const { getUserByID } = useUserApi();

    useEffect(() => {
        if (!id) {
            // TODO
            console.error('No user has been selected!');
            return;
        }

        getUserByID(id)
            .then((user) => setUser(user))
            .catch((_) => console.error('User not found!'));
    }, []);

    return (
        <section>
            <Header>
                <h1>User Information</h1>
            </Header>

            <div className="userInfo">
                {user?.email}
                <br />
                {user?.fullName}
                <br />
                {user?.role}
            </div>
        </section>
    );
};

export default UserDetails;
