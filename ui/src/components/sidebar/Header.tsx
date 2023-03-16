import React from 'react';

import pawlsLogo from '../../assets/images/pawlsLogo.png';
import styled from 'styled-components';

export const Header = () => {
    return (
        <>
            <Logo src={pawlsLogo} />
        </>
    );
};

const Logo = styled.img`
    max-width: 100%;
`;
