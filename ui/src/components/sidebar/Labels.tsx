import React, { useContext } from 'react';
import styled from 'styled-components';
import { Switch } from '@allenai/varnish';

import { AnnotationStore } from '../../context';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { SidebarItem, SidebarItemTitle } from './common';

import DropdownOntoClasses from './DropdownOntoClasses';
import { DownloadExportedAnnotations } from './DownloadExportedAnnotations';
import CreationRelation from './CreationRelation';

interface LabelsProps {
    sha: string;
    _setRelationModalVisible: (state: boolean) => void;
}

const Labels: React.FC<LabelsProps> = ({ sha, _setRelationModalVisible }) => {
    const annotationStore = useContext(AnnotationStore);
    const onToggle = () => {
        annotationStore.toggleFreeFormAnnotations(!annotationStore.freeFormAnnotations);
    };

    return (
        <SidebarItem>
            <DownloadExportedAnnotations sha={sha}></DownloadExportedAnnotations>
            <div>
                <SidebarItemTitle>Relation Mode</SidebarItemTitle>
                <CreationRelation
                    setRelationModalVisible={_setRelationModalVisible}></CreationRelation>
            </div>
            <SidebarItemTitle>Classes</SidebarItemTitle>
            <Container>
                <div>
                    <DropdownOntoClasses annotationStore={annotationStore}></DropdownOntoClasses>
                </div>
                <div>
                    Free Form Annotations
                    <Toggle
                        size="small"
                        onChange={onToggle}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                    />
                </div>
            </Container>
        </SidebarItem>
    );
};

export default Labels;

const Toggle = styled(Switch)`
    margin: 4px;
`;

const Container = styled.div(
    ({ theme }) => `
   margin-top: ${theme.spacing.sm};
   div + div {
       margin-top: ${theme.spacing.md};
   }

`
);
