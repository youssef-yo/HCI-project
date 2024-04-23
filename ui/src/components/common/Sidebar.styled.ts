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
    background: #023E8A;
    color: ${theme.color.N2};
    padding: ${theme.spacing.md} ${theme.spacing.md};
    height: 100vh;
    * {
        color: white;
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
