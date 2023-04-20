import styled from 'styled-components';

const Header = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 16px;

    & h1 {
        margin: 0px;
    }
`;

export default Header;
