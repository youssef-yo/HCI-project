// import styled from 'styled-components';
import { SidebarItem, SidebarItemTitle } from './common';
// import { notification } from '@allenai/varnish';
import { Annotation } from '../../context';

// import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
// import { AnnotationSummary } from '../AnnotationSummary';
import { AnnotationsByClass } from '../AnnotationsByClass';
import { Task } from '../../api';

import { CiCircleQuestion } from "react-icons/ci";
import CustomTooltip from '../common/CustomTooltip';
import styled from 'styled-components';

interface AnnotationsProps {
    taskId: string;
    activeTask: Task;
    annotations: Annotation[];
}

const Annotations = ({ annotations }: AnnotationsProps) => {
    const tooltipText = (
        <>
            <b>How to make an annotation:</b>
            <ul>
                <li>select the annotation class from the label dropdown</li>
                <li>click on any word in the pdf</li>
            </ul>
            <b>Useful tip:</b>
            <p>Press CTRL to show/hide annotation labels.</p>
        </>
    );
    // const { markTaskComplete } = useTaskApi();

    // const onFinishToggle = (isFinished: boolean) => {
    //     markTaskComplete(taskId, isFinished).then(() => {
    //         if (isFinished) {
    //             notification.success({ message: 'Marked task as Finished!' });
    //         } else {
    //             notification.info({ message: 'Marked task as In Progress.' });
    //         }
    //     });
    // };

    return (
        <SidebarItemWrapper>
            <div style={{ display: "flex", alignItems: "center" }}>
                <SidebarItemTitle>
                Annotations
                <CustomTooltip placement="right" tooltipText={tooltipText}>
                    <div style={{ marginLeft: "10px", cursor: "pointer" }}>
                        <CiCircleQuestion size={20} />
                    </div>
                </CustomTooltip>
                </SidebarItemTitle>
            </div>
            <SidebarItem>
                {/* <ExplainerText>
                    <InfoCircleOutlined style={{ marginRight: '3px' }} />
                    Use CMD + z to undo the last annotation.
                </ExplainerText>
                <ExplainerText>
                    <InfoCircleOutlined style={{ marginRight: '3px' }} />
                    Press CTRL to show/hide annotation labels for small annotations.
                </ExplainerText> */}
                {/* <span>
                    <ToggleDescription>Finished?</ToggleDescription>
                    <Toggle
                        size="small"
                        defaultChecked={activeTask.markedComplete}
                        onChange={(e) => onFinishToggle(e)}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                    />
                </span> */}
                <div>
                    {annotations.length === 0 ? (
                        <span style={{ color: 'black' }}>No Annotations Yet </span>
                    ) : (
                        <div>
                            <AnnotationsByClass annotations={annotations} />
                        </div>
                    )}
                </div>
            </SidebarItem>
        </SidebarItemWrapper> 
    );
};

export default Annotations;

// const ExplainerText = styled.div`
//     font-size: ${({ theme }) => theme.spacing.sm};

//     &,
//     & * {
//         color: ${({ theme }) => theme.color.N6};
//     }
// `;

// const Toggle = styled(Switch)`
//     margin: 8px 8px;
// `;
// const ToggleDescription = styled.span`
//     font-size: 0.85rem;
//     color: ${({ theme }) => theme.color.N6};
// `;

const SidebarItemWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  
  box-sizing: border-box;
`;
