import { MdOutlineHouse, MdAccountCircle, MdOutlineSave } from 'react-icons/md';
import { StyledTopbar } from './Topbar.styled';
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
                    <MdOutlineHouse style={{ fontSize: '25px' }} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdOutlineSave style={{ fontSize: '25px' }} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdAccountCircle
                        onClick={() => setAccountInfoModal(true)}
                        style={{ fontSize: '25px' }}
                    />
                </div>
            </StyledTopbar>

            <AccountInfoModal show={accountInfoModal} onHide={handleAccountInfoModalClose} />
        </>
    );
};
export default AnnotationTopbar;
export { WithTopbar } from './Topbar.styled';
