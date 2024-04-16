import { MdOutlineHouse, MdAccountCircle, MdOutlineSave } from 'react-icons/md';
import { StyledTopbar } from './Topbar.styled';
import AccountInfoModal from '../../components/dashboard/AccountInfoModal';
import { useState, useEffect } from 'react';
import { notification } from '@allenai/varnish';
import ChoiceClass from './ChoiceClass';
import FreeFormToggle from './FreeFormToggle';

export type AnnotationTopbarProps = {
    height: string;
    leftOffset?: string;
};

const AnnotationTopbar: React.FC<AnnotationTopbarProps> = ({ height, leftOffset }) => {
    const [accountInfoModal, setAccountInfoModal] = useState<boolean>(false);
    const [showSaveNotification, setSaveShowNotification] = useState<boolean>(false);

    const Divider = () => (
        <div
            style={{
                height: '100%',
                borderLeft: '2px solid black',
                margin: '0 10px',
            }}
        />
    );

    const handleAccountInfoModalClose = () => {
        console.log('Closing account info modal');
        setAccountInfoModal(false);
    };

    useEffect(() => {
        if (showSaveNotification === true) {
            notification.success({
                message: 'Saved',
            });
        }
        setSaveShowNotification(false);
    });

    return (
        <>
            <StyledTopbar height={height} leftOffset={leftOffset}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdOutlineHouse style={{ color: 'black', fontSize: '25px' }} />
                </div>
                <Divider />
                <ChoiceClass />
                <Divider />
                <FreeFormToggle />
                <Divider />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdOutlineSave
                        onClick={() => setSaveShowNotification(true)}
                        style={{ color: 'black', fontSize: '25px' }}
                    />
                </div>
                <Divider />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdAccountCircle
                        onClick={() => setAccountInfoModal(true)}
                        style={{ color: 'black', fontSize: '25px' }}
                    />
                </div>
            </StyledTopbar>

            <AccountInfoModal show={accountInfoModal} onHide={handleAccountInfoModalClose} />
        </>
    );
};
export default AnnotationTopbar;
export { WithTopbar } from './Topbar.styled';
