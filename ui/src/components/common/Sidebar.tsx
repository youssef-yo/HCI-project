import React from 'react';
import { StyledSidebar } from './Sidebar.styled';
import styled from 'styled-components';
import Logo from '../sidebar/Logo';

export type SidebarProps = {
    width: string;
    children: React.ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ width, children }) => {
    return (
        <StyledSidebar width={width}>
            <LogoWrapper>
                <Logo />
            </LogoWrapper>
            <ContentWrapper>{children}</ContentWrapper>
        </StyledSidebar>
    );
};

export default Sidebar;

export { WithSidebar } from './Sidebar.styled';

export const LogoWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: lightgrey;
    z-index: 1;
    padding: 10px;
    border-bottom: 1px solid black;
`;

export const ContentWrapper = styled.div`
    margin-top: 80px;
`;
