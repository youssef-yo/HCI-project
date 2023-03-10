import React from 'react';
import { InputBox, StyledInput } from './Input.styled';

export enum InputType {
    STANDARD = 'standard',
}

export type InputProps = {
    type?: 'text' | 'password';
    variant?: InputType;
} & Omit<React.ComponentProps<'input'>, 'ref' | 'type'>;

export type InputBoxProps = {
    variant?: InputType;
};

export const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder,
    variant = InputType.STANDARD,
    ...rest
}) => {
    switch (variant) {
        case InputType.STANDARD:
            return (
                <InputBox variant={variant}>
                    <StyledInput type={type} variant={variant} {...rest} />
                    <i>{placeholder}</i>
                </InputBox>
            );
    }
};
