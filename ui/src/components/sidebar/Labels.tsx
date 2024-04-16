import React, { useContext } from 'react';
import styled from 'styled-components';
import { Switch } from '@allenai/varnish';

import { AnnotationStore } from '../../context';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { SidebarItem, SidebarItemTitle } from './common';

import DropdownOntoClasses from './DropdownOntoClasses';
// import CreationRelation from './CreationRelation';

// interface LabelsProps {
//     _setRelationModalVisible: (state: boolean) => void;
// }

const Labels: React.FC = () => {
    const annotationStore = useContext(AnnotationStore);
    const onToggle = () => {
        annotationStore.toggleFreeFormAnnotations(!annotationStore.freeFormAnnotations);
    };

    return (
        <SidebarItem>
            <div>
                <SidebarItemTitle>Relation Mode</SidebarItemTitle>
                {/* <CreationRelation
                    setRelationModalVisible={_setRelationModalVisible}></CreationRelation> */}
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
