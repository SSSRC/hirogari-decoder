import React from 'react';
import AlertCard from './AlertCard';

interface Args {
    setAlertElement: (arg: JSX.Element) => void;
    errorMessageHandler: (
        arg: string
    ) => [string, string | string[], string | string[]];
    warningMessageHandler: (arg: string) => string[];
    successMessageHandler: (arg: string) => string[];
}

let timeoutId: NodeJS.Timeout;

class AlertHandler {
    private setAlertElement: Args['setAlertElement'];
    private errorMessageHandler: Args['errorMessageHandler'];
    private warningMessageHandler: Args['warningMessageHandler'];
    private successMessageHandler: Args['successMessageHandler'];

    constructor(args: Args) {
        this.setAlertElement = args.setAlertElement;
        this.errorMessageHandler = args.errorMessageHandler;
        this.warningMessageHandler = args.warningMessageHandler;
        this.successMessageHandler = args.successMessageHandler;
    }

    public showAlert(
        message: string,
        severity: 'error' | 'warning' | 'success'
    ): void {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        let id: string;
        let messagesJa: string | string[];
        let messagesEn: string | string[];

        if (severity === 'warning') {
            [id, messagesJa, messagesEn] = this.warningMessageHandler(message);
        } else if (severity === 'success') {
            [id, messagesJa, messagesEn] = this.successMessageHandler(message);
        } else {
            [id, messagesJa, messagesEn] = this.errorMessageHandler(message);
        }

        this.setAlertElement(
            <AlertCard
                id={id}
                messagesJa={messagesJa}
                messagesEn={messagesEn}
                severity={severity}
                onClose={() => {
                    this.hideAlert();
                }}
            />
        );

        this.hideAlertAsync();
    }

    public hideAlertAsync(): void {
        const id = setTimeout(() => {
            this.hideAlert();
        }, 10 * 1000);

        timeoutId = id;
    }

    public hideAlert(): void {
        this.setAlertElement(<></>);
    }
}

export default AlertHandler;
