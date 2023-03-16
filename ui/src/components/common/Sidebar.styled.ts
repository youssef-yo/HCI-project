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
    background: ${theme.color.N10};
    color: ${theme.color.N2};
    padding: ${theme.spacing.md} ${theme.spacing.md};
    height: 100vh;
    * {
        color: ${theme.color.N2};
    }
`
);

export const WithSidebar = styled.div<SidebarProps>(({ theme, width }) => {
    console.log('Allen AI Theme:');
    console.log(theme);
    return `
    position: relative;
    display: grid;
    flex-grow: 1;
    grid-template-columns: minmax(0, 1fr);
    padding-left: ${width};
`;
});
