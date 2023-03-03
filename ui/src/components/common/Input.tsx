import React from 'react';
import { InputBox, StyledInput } from './Input.styled';

export enum InputType {
    STANDARD = 'standard',
}

export type InputProps = {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeHolder?: string;
    type?: 'text' | 'password';
    id?: string;
    variant?: InputType;
    disabled?: boolean;
    required?: boolean;
};

export type InputBoxProps = {
    variant?: InputType;
};

export const Input: React.FC<InputProps> = ({
    onChange,
    value,
    type = 'text',
    placeHolder,
    variant = InputType.STANDARD,
    id,
    disabled,
    required,
}) => {
    switch (variant) {
        case InputType.STANDARD:
            return (
                <InputBox variant={variant}>
                    <StyledInput
                        onChange={onChange}
                        value={value}
                        type={type}
                        id={id}
                        variant={variant}
                        disabled={disabled}
                        required={required}
                    />
                    <i>{placeHolder}</i>
                </InputBox>
            );
    }
};
