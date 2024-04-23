import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { OntoClass } from '../../api';

const App = ({ annotationStore }: { annotationStore: any }) => {
    const [classes, setClasses]: [classes: any, setClasses: any] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        console.log('useEffect - AnnotationStore.ontoClasses: ', annotationStore.ontoClasses);
        console.log('useEffect - AnnotationStore.ontoProperty: ', annotationStore.ontoProperties);
        const listLabels = annotationStore.ontoClasses.map((ontoClass: OntoClass) => ({
            value: ontoClass.id,
            label: ontoClass.text,
        }));
        setClasses(listLabels);
    }, [annotationStore.ontoClasses]);
    useEffect(() => {
        // Update selected class when annotationStore.activeOntoClass changes
        if (annotationStore.activeOntoClass) {
            setSelectedClass({
                value: annotationStore.activeOntoClass.id,
                label: annotationStore.activeOntoClass.text,
            });
        }
    }, [annotationStore.activeOntoClass]);
    const colourStyles = {
        control: (styles: any) => ({ ...styles, backgroundColor: 'white', width: '350px' }),
        option: (styles: any) => {
            return {
                ...styles,
                color: 'black',
                cursor: 'default',
                zIndex: 300,
            };
        },
    };
    const ontoClassFromId = (id: string) => {
        return annotationStore.ontoClasses.find((ontoClass: OntoClass) => {
            return ontoClass.id === id;
        });
    };
    return (
        <Select
            options={classes}
            styles={colourStyles}
            value={selectedClass}
            onChange={(choice: any) => {
                const resultClass: OntoClass | undefined = ontoClassFromId(choice.value);
                // setUserChoice(choice.label);
                console.log('choice.label: ', choice.label);
                console.log('Class found from id ', choice.value, ' is: ', resultClass);
                annotationStore.setActiveOntoClass(resultClass);
            }}
        />
    );
};

export default App;
