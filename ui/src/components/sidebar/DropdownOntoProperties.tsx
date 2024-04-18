import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { AnnotationStore } from '../../context';
import { OntoProperty } from '../../api';

interface DropdownPropertiesProps {
    ontoProperties: OntoProperty[];
}
const App = ({ ontoProperties }: DropdownPropertiesProps) => {
    const annotationStore = useContext(AnnotationStore);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [properties, setProperties]: [properties: any, setProperties: any] = useState([]);
    useEffect(() => {
        const listLabels = ontoProperties.map((ontoProperty: OntoProperty) => ({
            value: ontoProperty.id,
            label: ontoProperty.text,
        }));
        setProperties(listLabels);
        console.log('bbbbbbbbb', annotationStore.activeOntoProperty);
    }, [ontoProperties]);
    useEffect(() => {
        // Update selected property when annotationStore.activeOntoProperty changes
        if (annotationStore.activeOntoProperty) {
            setSelectedProperty({
                value: annotationStore.activeOntoProperty.id,
                label: annotationStore.activeOntoProperty.text,
            });
        }
    }, [annotationStore.activeOntoProperty]);
    const colourStyles = {
        control: (styles: any) => ({ ...styles, backgroundColor: 'white', width: '350px' }),
        option: (styles: any) => {
            return {
                ...styles,
                color: 'black',
                cursor: 'default',
                zIndex: 100,
            };
        },
    };
    const ontoPropertyFromId = (id: string) => {
        return ontoProperties.find((ontoProperty: OntoProperty) => {
            return ontoProperty.id === id;
        });
    };
    return (
        <Select
            options={properties}
            styles={colourStyles}
            value={selectedProperty}
            onChange={(choice: any) => {
                const resultProperty: OntoProperty | undefined = ontoPropertyFromId(choice.value);
                console.log('choice.label: ', choice.label);
                console.log('Property found from id ', choice.value, ' is: ', resultProperty);
                if (resultProperty !== undefined) {
                    annotationStore.setActiveOntoProperty(resultProperty);
                }
            }}
        />
    );
};

export default App;
