import React from 'react';
import { StyledSidebar } from './Sidebar.styled';

export type SidebarProps = {
    width: string;
    children: React.ReactNode;
};

export const Sidebar: React.FC<SidebarProps> = ({ width, children }) => {
    return <StyledSidebar width={width}>{children}</StyledSidebar>;
};

export { WithSidebar } from './Sidebar.styled';
