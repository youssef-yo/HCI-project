import styled from 'styled-components';
import { SidebarProps } from './Sidebar';
import { AnnotationSidebarProps } from './AnnotationSidebar';

export const StyledAnnotationSidebar = styled.div<AnnotationSidebarProps>(
    ({ theme, width }) => `
    display: flex;
    flex-direction: column;
    gap: 0;
    width: ${width};
    position: fixed;
    left: 0;
    overflow-y: auto;
    background: white;
    color: ${theme.color.N2};
    padding: 0;
    height: 100%;
    * {
        color: black;
    }
    border-right: 1px solid black;
`
);

export const StyledSidebar = styled.div<SidebarProps>(
    ({ theme, width }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md} ;
    width: ${width};
    position: fixed;
    left: 0;
    overflow-y: auto;
    background: #000080;
    // background: #023E8A;
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
