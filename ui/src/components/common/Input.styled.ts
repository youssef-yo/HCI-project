import styled, { css } from 'styled-components';
import { InputBoxProps, InputProps } from './Input';

const INPUT_COLOR = {
    primary: css`
        background: #333;
        color: #fff;
    `,
    secondary: css`
        background: #dfdfdf;
        color: #333;
    `,
};

export const StyledInput = styled.input<InputProps>(
    ({ width }) =>`
    position: relative;
    width: ${width};
    border: 1px solid black;
    border-radius: 8px;
    outline: none;
    padding: 25px 10px 7.5px;
    font-weight: 500;
    font-size: 1em;

    ${(props) => props.color && INPUT_COLOR[props.color]}
`);

const BOX_COLOR = {
    primary: css`
        i {
            color: #aaa;
        }
    `,
    secondary: css`
        i {
            color: #555;
        }
    `,
};

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
        transition: 0.5s;
        pointer-events: none;
    }

    ${(props) => props.color && BOX_COLOR[props.color]}
`;
