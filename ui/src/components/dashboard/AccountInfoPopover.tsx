import React from 'react';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../hooks';
import { MdAccountCircle } from 'react-icons/md';

type AccountInfoPopoverProps = {
    show: boolean;
    onHide: () => void;
    setAccountInfoPopoverShow: (show: boolean) => void;
    iconColor: string;
};

const AccountInfoPopover: React.FC<AccountInfoPopoverProps> = ({
    show,
    onHide,
    setAccountInfoPopoverShow,
    iconColor,
}) => {
    const logout = useLogout();
    const navigate = useNavigate();
    const { auth } = useAuth();

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
        <>
            {show && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        zIndex: 999,
                    }}
                    onClick={onHide}
                />
            )}
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
                        onClick={() => setAccountInfoPopoverShow(!show)}
                        style={{
                            color: iconColor,
                            fontSize: '25px',
                            cursor: 'pointer',
                        }}
                    />
                </div>
            </OverlayTrigger>
        </>
    );
};

export default AccountInfoPopover;
