import styled, { css } from 'styled-components';
import { ButtonProps } from './Button';

const COLOR = {
    primary: css`
        background: #bf0b0b;
        color: #eee;

        &:hover {
            background: #f10e0e;
        }
    `,
    // secondary: button create top right in each section
    secondary: css`
        background: #48CAE4;
        color: #000;

        &:hover {
            background: #ADE8F4;
        }
    `,
};

const SIZE = {
    small: css`
        padding: 4px 12px;
        font-size: 0.875em;
    `,
    medium: css`
        padding: 6px 18px;
        font-size: 1em;
    `,
    large: css`
        padding: 8px 24px;
        font-size: 1.25em;
    `,
};

const DISABLED = css`
    cursor: not-allowed;
`;

const StyledButton = styled.button<ButtonProps>`
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;

    border: none;
    outline: none;
    border-radius: 4px;

    font-weight: 600;
    line-height: 1.75;
    letter-spacing: 0.05em;
    text-transform: uppercase;

    transition: 200ms ease-out;
    cursor: pointer;

    & .button__icon {
        display: inherit;
        margin-left: -4px;
        margin-right: 8px;
    }

    ${(props) => props.color && COLOR[props.color]}
    ${(props) => props.size && SIZE[props.size]}
    ${(props) => props.disabled && DISABLED}
`;

export default StyledButton;
