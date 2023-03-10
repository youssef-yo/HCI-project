import React from 'react';
import StyledButton from './Button.styled';

export type ButtonProps = {
    variant?: 'primary';
} & Omit<React.ComponentProps<'button'>, 'ref'>;

export const Button: React.FC<ButtonProps> = ({ children, variant, ...rest }) => {
    return (
        <StyledButton variant={variant} {...rest}>
            {children}
        </StyledButton>
    );
};
