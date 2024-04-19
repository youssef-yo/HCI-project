import styled from 'styled-components';

type HeaderProps = {
    justifyContent: string;
}

const Header = styled.div<HeaderProps>(
    ({ justifyContent }) =>`
    display: flex;
    flex-direction: row;
    justify-content: ${justifyContent};
    align-items: center;
    text-align: center;
    
    margin-bottom: 16px;
    margin-top: 16px;

    & h1 {
        margin: 0px;
    }
`);

export default Header;
