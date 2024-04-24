import styled from 'styled-components';
import { SidebarItem, SidebarItemTitle } from './common';
import { Annotation } from '../../context';

import { InfoCircleOutlined } from '@ant-design/icons';
import { AnnotationSummary } from '../AnnotationsByClass';

interface AnnotationsProps {
    annotations: Annotation[];
}

const CommitAnnotations = ({ annotations }: AnnotationsProps) => {
    return (
        <SidebarItem>
            <SidebarItemTitle>Annotations</SidebarItemTitle>
            <ExplainerText>
                <InfoCircleOutlined style={{ marginRight: '3px' }} />
                Use CMD + z to undo the last annotation.
            </ExplainerText>
            <ExplainerText>
                <InfoCircleOutlined style={{ marginRight: '3px' }} />
                Press CTRL to show/hide annotation labels for small annotations.
            </ExplainerText>
            <div>
                {annotations.length === 0 ? (
                    <>No Annotations Yet :(</>
                ) : (
                    <div>
                        {annotations.map((annotation) => (
                            <AnnotationSummary key={annotation.id} annotation={annotation} />
                        ))}
                    </div>
                )}
            </div>
        </SidebarItem>
    );
};

export default CommitAnnotations;

const ExplainerText = styled.div`
    font-size: ${({ theme }) => theme.spacing.sm};

    &,
    & * {
        color: ${({ theme }) => theme.color.N6};
    }
`;
