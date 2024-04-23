import React, { useState, useEffect, useContext } from 'react';
import { MdOutlineHouse, MdOutlineSave } from 'react-icons/md';
import { StyledTopbar } from './Topbar.styled';
import AccountInfoPopover from '../../components/dashboard/AccountInfoPopover';
import { notification } from '@allenai/varnish';
import ChoiceClass from './ChoiceClass';
import FreeFormToggle from './FreeFormToggle';
import RelationModeToggle from './RelationModeToggle';
import AnnotationRelationModeTopbar from './AnnotationRelationModeTopbar';
import { AnnotationStore, RelationGroup } from '../../context';

export type AnnotationTopbarProps = {
    onCreate: (group: RelationGroup) => void;
    height: string;
    leftOffset?: string;
};

const AnnotationTopbar: React.FC<AnnotationTopbarProps> = ({ onCreate, height, leftOffset }) => {
    const annotationStore = useContext(AnnotationStore);
    const [accountInfoPopoverShow, setAccountInfoPopoverShow] = useState<boolean>(false);
    const [showSaveNotification, setSaveShowNotification] = useState<boolean>(false);
    const [relationModeActive, setRelationModeActive] = useState<boolean>(false);

    const handleToggleRelationMode = () => {
        setRelationModeActive(!relationModeActive);
        if (!relationModeActive) {
            annotationStore.setSelectedAnnotations([]);
            annotationStore.setSrc(null);
            annotationStore.setDst(null);
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
        setAccountInfoPopoverShow(false);
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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <ChoiceClass />
                </div>
                <Divider />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <RelationModeToggle onToggle={handleToggleRelationMode} />
                </div>
                <Divider />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <FreeFormToggle />
                </div>
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
                    <AccountInfoPopover
                        show={accountInfoPopoverShow}
                        onHide={handleAccountInfoModalClose}
                        setAccountInfoPopoverShow={setAccountInfoPopoverShow}
                    />
                </div>
            </StyledTopbar>

            {relationModeActive && (
                <AnnotationRelationModeTopbar
                    onCreate={onCreate}
                    height={height}
                    leftOffset={leftOffset}
                />
            )}
        </>
    );
};
export default AnnotationTopbar;
export { WithTopbar } from './Topbar.styled';
