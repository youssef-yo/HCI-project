import styled, { css } from 'styled-components';
import { ButtonProps } from './Button';

const VARIANT = {
    primary: css`
        background: #bf0b0b;
        color: #eee;
    `,
};

const DISABLED = css`
    cursor: not-allowed;
`;

const StyledButton = styled.button<ButtonProps>`
    position: relative;
    border: none;
    outline: none;
    padding: 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 1.25em;
    letter-spacing: 0.05em;
    cursor: pointer;

    ${(props) => props.variant && VARIANT[props.variant]}
    ${(props) => props.disabled && DISABLED}
`;

export default StyledButton;
