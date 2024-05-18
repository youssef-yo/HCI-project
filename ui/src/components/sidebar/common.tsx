import styled from 'styled-components';
import { Link, Button } from '@allenai/varnish';

// interface HasWidth {
//     width: string;
// }

// export const SidebarContainer = styled.div<HasWidth>(
//     ({ theme, width }) => `
//     width: ${width};
//     position: fixed;
//     left: 0;
//     overflow-y: scroll;
//     background: ${theme.color.N10};
//     color: ${theme.color.N2};
//     padding: ${theme.spacing.md} ${theme.spacing.md};
//     height: 100vh;
//     * {
//         color: ${theme.color.N2};
//     }
// `
// );

export const SidebarItem = styled.div(
    ({ theme }) => `
    overflow-y: auto;
    background: white;
    color: black;
    width: ${theme.sidebarWidth};
    min-height: 267px;
    max-height: 268px;
    padding: 10px;
`
);

// text-transform is necessary because h5 is all caps in antd/varnish.
export const SidebarItemTitle = styled.h5(
    ({ theme }) => `
    text-transform: capitalize;
    padding-top: ${theme.spacing.xs};
    padding-bottom: ${theme.spacing.xs};
    border-bottom: 1px solid black;
    border-top: 1px solid black;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: break-all;
    color: black;
    position: relative;
    text-align: center;
    margin: 0 auto;
    background: lightblue;
`
);


export const Contrast = styled.div`
    a[href] {
        ${Link.contrastLinkColorStyles()};
    }
    line-height: 1;
    font-size: 0.85rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

export const SmallButton = styled(Button)`
    padding: 2px 4px;
    height: auto;
    font-size: 0.85rem;
    margin-left: 10px;
`;
