import React from 'react';
import { InputBox, StyledInput } from './Input.styled';

export enum InputType {
    STANDARD = 'standard',
}

export type InputProps = {
    type?: 'text' | 'password' | 'number';
    variant?: InputType;
    color?: 'primary' | 'secondary';
} & Omit<React.ComponentProps<'input'>, 'ref' | 'type' | 'color'>;

export type InputBoxProps = {
    variant?: InputType;
    color?: 'primary' | 'secondary';
};

const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder,
    variant = InputType.STANDARD,
    color = 'primary',
    ...rest
}) => {
    switch (variant) {
        case InputType.STANDARD:
            return (
                <InputBox variant={variant} color={color}>
                    <StyledInput type={type} variant={variant} color={color} {...rest} />
                    <i>{placeholder}</i>
                </InputBox>
            );
    }
};

export default Input;
