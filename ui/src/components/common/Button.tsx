import React from 'react';
import StyledButton from './Button.styled';

export type ButtonProps = {
    color?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    icon?: JSX.Element,
    marginLeft: 'auto';
} & Omit<React.ComponentProps<'button'>, 'ref' | 'color'>;

const Button: React.FC<ButtonProps> = ({
    children,
    color = 'primary',
    size = 'medium',
    icon,
    marginLeft,
    ...rest
}) => {
    return (
        <StyledButton color={color} size={size} marginLeft={marginLeft} {...rest}>
            {icon && <span className="button__icon">{icon}</span>}
            {children}
        </StyledButton>
    );
};

export default Button;
