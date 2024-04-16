import styled from 'styled-components';
import { TopbarProps } from './Topbar';

export const StyledAnnotationTopbar = styled.div<TopbarProps>(
    ({ height }) => `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f0f0f0;
        padding: 0 20px;
        height: ${height};
        position: relative;
        z-index: 1000;
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
