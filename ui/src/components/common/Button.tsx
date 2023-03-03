import React from 'react';
import StyledButton from './Button.styled';

export type ButtonProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children?: React.ReactNode;
    variant?: 'primary';
    disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant, disabled }) => {
    return (
        <StyledButton onClick={onClick} disabled={disabled} variant={variant}>
            {children}
        </StyledButton>
    );
};
