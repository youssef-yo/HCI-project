import React, { useState, useEffect, useContext } from 'react';
import { MdOutlineHouse, MdAccountCircle, MdOutlineSave } from 'react-icons/md';
import { StyledTopbar } from './Topbar.styled';
import AccountInfoModal from '../../components/dashboard/AccountInfoModal';
import { notification } from '@allenai/varnish';
import ChoiceClass from './ChoiceClass';
import FreeFormToggle from './FreeFormToggle';
import RelationModeToggle from './RelationModeToggle';
import AnnotationRelationModeTopbar from './AnnotationRelationModeTopbar';
import { AnnotationStore } from '../../context';

export type AnnotationTopbarProps = {
    height: string;
    leftOffset?: string;
};

const AnnotationTopbar: React.FC<AnnotationTopbarProps> = ({ height, leftOffset }) => {
    const annotationStore = useContext(AnnotationStore);
    const [accountInfoModal, setAccountInfoModal] = useState<boolean>(false);
    const [showSaveNotification, setSaveShowNotification] = useState<boolean>(false);
    const [relationModeActive, setRelationModeActive] = useState<boolean>(false);

    const handleToggleRelationMode = () => {
        setRelationModeActive(!relationModeActive);
        if (!relationModeActive) {
            annotationStore.setSelectedAnnotations([]);
        }
    };

    const Divider = () => (
        <div
            style={{
                height: '100%',
                borderLeft: '1px solid black',
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
                        marginLeft: '20px',
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
                <RelationModeToggle onToggle={handleToggleRelationMode} />
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
                        marginRight: '20px',
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

            {relationModeActive && (
                <AnnotationRelationModeTopbar height={height} leftOffset={leftOffset} />
            )}

            <AccountInfoModal show={accountInfoModal} onHide={handleAccountInfoModalClose} />
        </>
    );
};
export default AnnotationTopbar;
export { WithTopbar } from './Topbar.styled';
