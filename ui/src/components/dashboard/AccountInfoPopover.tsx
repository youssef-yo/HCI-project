import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, useLogout } from '../../hooks';
import { MdAccountCircle } from 'react-icons/md';

type AccountInfoPopoverProps = {
    show: boolean;
    onHide: () => void;
    setAccountInfoModal: (boolean) => void;
};

const AccountInfoPopover: React.FC<AccountInfoPopoverProps> = ({
    show,
    onHide,
    setAccountInfoPopoverShow,
}) => {
    const logout = useLogout();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [hovered, setHovered] = useState(false);

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    const popover = (
        <Popover id="account-info-popover">
            <Popover.Body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'blue',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px',
                        }}>
                        {auth?.username ? auth.username.charAt(0).toUpperCase() : ''}
                    </div>
                    <p>
                        <b> Role: </b>
                        {auth?.role}
                        <br />
                        <b> Email: </b>
                        {auth?.username}
                    </p>
                    <Button variant="danger" onClick={onLogout}>
                        Logout
                    </Button>
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom"
            show={show}
            onHide={onHide}
            overlay={popover}
            rootClose>
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                }}>
                <MdAccountCircle
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => setAccountInfoPopoverShow(!show)}
                    style={{
                        color: 'black',
                        fontSize: hovered ? '27px' : '25px',
                        transition: 'font-size 0.3s',
                    }}
                />
            </div>
        </OverlayTrigger>
    );
};

export default AccountInfoPopover;
