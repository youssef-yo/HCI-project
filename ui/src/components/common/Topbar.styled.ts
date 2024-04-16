import styled from 'styled-components';
import { TopbarProps } from './Topbar';

export const StyledRelationModeTopbar = styled.div<TopbarProps>(
    ({ theme, height, leftOffset }) => `
        position: fixed;
        top: ${height};
        left: ${leftOffset};
        right: 0;
        display: flex;
        justify-content: space-between;
        height: ${height};
        background: white;
        color: #eee;
        padding: ${theme.spacing.md};
        z-index: 1000;
        border-bottom: 1px solid black;

        & div > button {
            &:hover {
                background: rgba(255, 255, 255, 0.1);
            }
    
            svg {
                fill: #ddd;
                stroke: #ddd;
                width: 1.25rem;
                height: 1.25rem;
            }
            &:hover > svg {
                fill: #fff;
                stroke: #fff;
            }
        }
    `
);

export const StyledTopbar = styled.div<TopbarProps>(
    ({ theme, height, leftOffset }) => `
        position: fixed;
        top: 0;
        left: ${leftOffset};
        right: 0;
        display: flex;
        justify-content: space-between;
        height: ${height};
        background: white;
        color: #eee;
        padding: ${theme.spacing.md};
        z-index: 1000;
        border-bottom: 1px solid black;

        & div > button {
            &:hover {
                background: rgba(255, 255, 255, 0.1);
            }
    
            svg {
                fill: #ddd;
                stroke: #ddd;
                width: 1.25rem;
                height: 1.25rem;
            }
            &:hover > svg {
                fill: #fff;
                stroke: #fff;
            }
        }
    `
);

export const WithTopbar = styled.div<TopbarProps>(
    ({ height }) => `
    position: relative;
    display: grid;
    flex-grow: 1;
    grid-template-columns: minmax(0, 1fr);
    padding-top: ${height};
`
);
