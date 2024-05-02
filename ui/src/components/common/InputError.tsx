import React from 'react';
import styled from 'styled-components';
import { InputBox, StyledInputError } from './Input.styled';

export enum InputType {
    STANDARD = 'standard',
}

export type InputPropsError = {
    type?: 'text' | 'password' | 'number';
    variant?: InputType;
    color?: 'primary' | 'secondary';
    bordColor?;
} & Omit<React.ComponentProps<'input'>, 'ref' | 'type' | 'color'>;

export type InputBoxProps = {
    variant?: InputType;
    color?: 'primary' | 'secondary';
};

const PlaceholderText = styled.i`
    color: red; /* Applica direttamente il colore rosso al tag <i> */
`;

const InputError: React.FC<InputPropsError> = ({
    type = 'text',
    placeholder,
    width,
    variant = InputType.STANDARD,
    color = 'primary',
    ...rest
}) => {
    switch (variant) {
        case InputType.STANDARD:
            return (
                <InputBox variant={variant} color={color}>
                    <StyledInputError width={width} type={type} variant={variant} color={color} {...rest} />
                    <PlaceholderText>{placeholder}</PlaceholderText>
                </InputBox>
            );
    }
};

export default InputError;
