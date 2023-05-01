import pawlsLogo from '../../assets/images/pawlsLogo.png';
import styled from 'styled-components';

const Logo = () => {
    return <StyledLogo src={pawlsLogo} />;
};

export default Logo;

const StyledLogo = styled.img`
    max-width: 100%;
`;
