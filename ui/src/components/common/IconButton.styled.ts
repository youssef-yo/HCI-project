import styled from 'styled-components';

const StyledIconButton = styled.button`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 12px;
    margin: 0px;
    border: 0px;
    border-radius: 50%;
    outline: 0px;

    font-size: 1.25rem;
    background: transparent;
    transition: 200ms ease-in;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.2);
    }
`;

export default StyledIconButton;
