import React, { useState } from 'react';
import { useDownloadFile } from '../../hooks';
import { Button, ButtonState } from './button';
import { useAnnotationApi } from '../../api';
import { notification } from '@allenai/varnish';

export const DownloadExportedAnnotations = ({ sha }: any) => {
    const [buttonState, setButtonState] = useState<ButtonState>(ButtonState.Primary);
    const { exportLatestAnnotations: exportAnnotations } = useAnnotationApi();

    const preDownloading = () => setButtonState(ButtonState.Loading);
    const postDownloading = () => setButtonState(ButtonState.Primary);

    const onErrorDownloadFile = () => {
        setButtonState(ButtonState.Primary);
        notification.warn({
            message: 'Export Failed.',
            description: 'Something went wrong!',
        });
    };

    const askApi = () => {
        return exportAnnotations(sha);
    };

    const { ref, url, download, name } = useDownloadFile({
        apiDefinition: askApi,
        preDownloading,
        postDownloading,
        onError: onErrorDownloadFile,
    });

    return (
        <>
            <Button label="Export Annotations" buttonState={buttonState} onClick={download} />
            <a href={url} download={name} className="danger" ref={ref} />
        </>
    );
};
