import { MdOutlineHouse, MdAccountCircle } from 'react-icons/md';
import { StyledTopbar } from './Topbar.styled';
import IconButton from './IconButton';
import AccountInfoModal from '../../components/dashboard/AccountInfoModal';
import { useState } from 'react';

export type AnnotationTopbarProps = {
    height: string;
    leftOffset?: string;
};

const AnnotationTopbar: React.FC<AnnotationTopbarProps> = ({ height, leftOffset }) => {
    const [accountInfoModal, setAccountInfoModal] = useState<boolean>(false);

    const handleAccountInfoModalClose = () => {
        console.log('Closing account info modal');
        setAccountInfoModal(false);
    };

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
                    <IconButton title="Back">
                        <MdOutlineHouse />
                    </IconButton>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdAccountCircle onClick={() => setAccountInfoModal(true)} />
                </div>
            </StyledTopbar>

            <AccountInfoModal show={accountInfoModal} onHide={handleAccountInfoModalClose} />
        </>
    );
};
export default AnnotationTopbar;
export { WithTopbar } from './Topbar.styled';
