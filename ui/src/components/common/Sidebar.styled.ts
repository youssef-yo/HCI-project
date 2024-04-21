import styled from 'styled-components';
import { SidebarProps } from './Sidebar';

export const StyledSidebar = styled.div<SidebarProps>(
    ({ theme, width }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    width: ${width};
    position: fixed;
    left: 0;
    overflow-y: auto;
    background: white;
    border-right: 1px solid black;
    color: black;
    padding: 0;
    height: 100%;
    * {
        color: ${theme.color.N2};
    }
`
);

export const WithSidebar = styled.div<SidebarProps>(({ width }) => {
    return `
    position: relative;
    display: grid;
    flex-grow: 1;
    grid-template-columns: minmax(0, 1fr);
    padding-left: ${width};
    color: black;
`;
});
