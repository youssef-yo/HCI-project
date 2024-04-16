import styled from 'styled-components';

const Header = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    
    margin-bottom: 16px;
    margin-top: 16px;

    & h1 {
        margin: 0px;
    }
`;

export default Header;
