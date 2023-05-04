import React, { ReactNode, createContext, useCallback, useRef, useState } from 'react';
import { ConfirmationDialog } from '../components/dialogs';

type ModalProviderProps = {
    children: ReactNode;
};

type ModalContextProps = {
    showConfirmation: (title: string, message: ReactNode) => Promise<boolean>;
};

type ConfirmModalState = {
    show: boolean;
    title?: string;
    message?: ReactNode;
};

export const DialogContext = createContext({} as ModalContextProps);

export const DialogProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({ show: false });
    const confirmFn = useRef<Function>();

    const showConfirmation = useCallback(
        (title: string, message: ReactNode) => {
            return new Promise<boolean>((resolve) => {
                setConfirmModalState({ show: true, title, message });

                confirmFn.current = (choice: boolean) => {
                    resolve(choice);
                    setConfirmModalState((prev) => {
                        return { ...prev, show: false };
                    });
                };
            });
        },
        [confirmModalState, setConfirmModalState]
    );

    return (
        <DialogContext.Provider value={{ showConfirmation }}>
            {children}
            <ConfirmationDialog
                {...confirmModalState}
                onHide={() => confirmFn.current && confirmFn.current(false)}
                onConfirm={() => confirmFn.current && confirmFn.current(true)}
            />
        </DialogContext.Provider>
    );
};
