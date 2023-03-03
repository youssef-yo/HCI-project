import styled from 'styled-components';
import { InputBoxProps, InputProps } from './Input';

export const StyledInput = styled.input<InputProps>`
    position: relative;
    width: 100%;
    background: #333;
    border: none;
    outline: none;
    padding: 25px 10px 7.5px;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    font-size: 1em;
`;

export const InputBox = styled.div<InputBoxProps>`
    position: relative;
    width: 100%;

    input:focus ~ i,
    input:valid ~ i {
        transform: translateY(-7.5px);
        font-size: 0.8em;
    }

    i {
        position: absolute;
        left: 0;
        padding: 15px 10px;
        font-style: normal;
        color: #aaa;
        transition: 0.5s;
        pointer-events: none;
    }
`;
