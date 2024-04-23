import React from 'react';
import StyledTable from './Table.styled';

export type TableProps = {
    color?: 'primary';
} & Omit<React.ComponentProps<'table'>, 'ref'>;

const Table: React.FC<TableProps> = ({ children, color, ...rest }) => {
    return (
        <StyledTable color={color} {...rest}>
            {children}
        </StyledTable>
    );
};

export default Table;
