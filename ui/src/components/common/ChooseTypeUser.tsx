import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

type Option<T> = {
    label: string;
    value: T;
};

type ChooseTypeUserProps<T> = {
    options: Option<T>[];
    onChange?: (value: Option<T>) => void;
};

const ChooseTypeUser = <T,>({
    options,
    onChange = (_) => {},
}: ChooseTypeUserProps<T>) =>{
    const [selectedOption, setSelectedOption] = useState<Option<T> | null>(null);

    const handleChange = (option: Option<T>) => {
        setSelectedOption(option);
        onChange(option.value);
    };
    

    return (
        <Form>
            <div style={{
                textAlign: 'left', 
                marginBottom: '1rem'
             }}>
                <span style={{ 
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                    }}>Select user role</span>
                <div key={`inline-radio`} className="mb-3">
                    {options.map((option, _) => (
                        <Form.Check
                            inline
                            name="userRole"
                            value={option.label}
                            label={option.label}
                            type="radio"
                            checked={selectedOption?.value === option.value}
                            onChange={() => handleChange(option)}
                            id={`check-type-${option.label}-user`}
                            style={{
                                marginLeft: '0',
                                fontSize: '1.1rem',
                            }}
                        />                  
                    ))}
                </div>
            </div>
        </Form>
    );
}

export default ChooseTypeUser;
