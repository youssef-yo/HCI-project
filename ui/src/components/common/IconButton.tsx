import React from 'react';
import StyledIconButton from './IconButton.styled';

type IconButtonProps = Omit<React.ComponentProps<'button'>, 'ref'>;

const IconButton: React.FC<IconButtonProps> = ({ children, ...rest }) => {
    return <StyledIconButton {...rest}>{children}</StyledIconButton>;
};

export default IconButton;
