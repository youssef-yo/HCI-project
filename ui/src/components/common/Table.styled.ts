import styled, { css } from 'styled-components';
import { TableProps } from './Table';

const COLOR = {
    primary: css`
        & thead tr {
            background-color: ${(props) => props.theme.color.N8};
            color: #eee;
        }

        & tbody tr {
            background-color: ${(props) => props.theme.color.N5};
        }
        & tbody tr:nth-child(2n) {
            background-color: ${(props) => props.theme.color.N4};
        }
    `,
};

const StyledTable = styled.table<TableProps>(
    ({ color }) =>`
    width: 100%;
    border-collapse: collapse;
    border-spacing: spacing;
    vertical-align: baseline;

    & thead th {
        position: relative;
        font-size: 1.25rem;
        font-weight: 600;
        text-transform: uppercase;
        background-color: ${color};
    }

    & tbody td {
        position: relative;
        font-size: 1.1rem;
        font-weight: 400;
    }

    & th,
    & td {
        padding: 8px;
    }

    ${(props) => props.color && COLOR[props.color]}
`);

export default StyledTable;
