import React from 'react';
import StyledHeader from './Header.styled';

type HeaderProps = Omit<React.ComponentProps<'header'>, 'ref'>;

const Header: React.FC<HeaderProps> = ({ children, ...rest }) => {
    return <StyledHeader {...rest}>{children}</StyledHeader>;
};

export default Header;
