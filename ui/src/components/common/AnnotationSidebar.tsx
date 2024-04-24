import React from 'react';
import { StyledAnnotationSidebar } from './Sidebar.styled';

export type AnnotationSidebarProps = {
    width: string;
    children: React.ReactNode;
};

const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({ width, children }) => {
    return <StyledAnnotationSidebar width={width}> {children} </StyledAnnotationSidebar>;
};

export default AnnotationSidebar;

export { WithSidebar } from './Sidebar.styled';
