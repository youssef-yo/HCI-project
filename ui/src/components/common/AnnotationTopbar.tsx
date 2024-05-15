import React, { useState, useContext, useEffect } from 'react';
import { MdOutlineSave, MdOutlineKeyboardReturn  } from 'react-icons/md';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { StyledAnnotationTopbar } from './Topbar.styled';
import AccountInfoPopover from '../../components/dashboard/AccountInfoPopover';
// import { notification } from '@allenai/varnish';
import ChoiceClass from './ChoiceClass';
import FreeFormToggle from './FreeFormToggle';
import RelationModeToggle from './RelationModeToggle';
import AnnotationRelationModeTopbar from './AnnotationRelationModeTopbar';
import { AnnotationStore, RelationGroup } from '../../context';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROLES } from '../../config/roles';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { Task, useTaskApi } from '../../api';
import CustomTooltip from './CustomTooltip';

export type AnnotationTopbarProps = {
    onCreate: (group: RelationGroup) => void;
    height: string;
    leftOffset?: string;
    taskId: string;
};

const AnnotationTopbar: React.FC<AnnotationTopbarProps> = ({ onCreate, height, leftOffset, taskId }) => {
    const annotationStore = useContext(AnnotationStore);
    const [accountInfoPopoverShow, setAccountInfoPopoverShow] = useState<boolean>(false);
    const [showSaveNotification, setSaveShowNotification] = useState<boolean>(false);
    const [relationModeActive, setRelationModeActive] = useState<boolean>(false);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [task, setTask] = useState<Task>();
    const { getTaskByID } = useTaskApi();

    useEffect(() => {
        if (!taskId) {
            // TODO
            console.error('No task has been selected!');
            return;
        }

        getTaskByID(taskId)
            .then((task) => {
                setTask(task);
            })
            .catch((err) => console.error(err));
    }, [taskId]);

    const topbarHeight = '55px';
    const relationModeTopbarHeight = '125px';

    const savingMessage = 'Task Correctly Saved!';

    const tooltipText = (
        <>
            <b>Task description:</b>
            <br />
            {task?.description}
        </>
     );

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

    return (
        <>
            <StyledAnnotationTopbar height={height} leftOffset={leftOffset}>
                <div
                    style={{
                        marginLeft: '20px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <MdOutlineKeyboardReturn
                        onClick={() => {
                            if (auth.role === ROLES.Admin) {
                                navigate(`/dash/tasks/${taskId}`)
                            } else if (auth.role === ROLES.Annotator) {
                                navigate(`/home/tasks/${taskId}`)
                            }                            
                        }}
                        style={{ color: 'black', fontSize: '25px' , cursor: 'pointer'}} />
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
                        style={{ color: 'black', fontSize: '25px' , cursor: 'pointer'}}
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
                    <CustomTooltip placement="bottom" tooltipText={tooltipText}>
                        <div>
                            <IoMdInformationCircleOutline 
                            style={{ color: 'black', fontSize: '25px', cursor: 'pointer'}}/>
                        </div>
                    </CustomTooltip>
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
                        iconColor="black"
                    />
                </div>
                <ToastContainer
                    className="p-3"
                    style={{
                        position: 'fixed',
                        top: relationModeActive ? relationModeTopbarHeight : topbarHeight,
                        left: '50%',
                        zIndex: 9999,
                    }}
                >
                    <Toast
                        show={showSaveNotification}
                        onClose={() => setSaveShowNotification(false)}
                        delay={2000}
                        autohide
                        className="bg-success"
                        style={{ width: `${savingMessage.length * 12}px` }}
                    >
                        {/* <Toast.Header>
                            <strong className="mr-auto">Notifica</strong>
                        </Toast.Header> */}
                        <Toast.Body className="text-white" style={{ textAlign: 'center' }}>{savingMessage}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </StyledAnnotationTopbar>

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
