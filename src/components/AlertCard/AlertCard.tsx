import React from 'react';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../../app/languageSlice';
import { Paper } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { alertCardStyles } from './alertCard.style';

interface Props {
    id: string;
    messagesJa: string | string[];
    messagesEn: string | string[];
    severity: 'error' | 'warning' | 'success';
    onClose?: () => void;
}

const AlertCard: React.FC<Props> = (props) => {
    const languageState = useSelector(selectLanguage);
    const language = languageState.language;

    const alertCardClasses = alertCardStyles();

    const messageElements: JSX.Element[] = [];

    const messages = language === 'ja' ? props.messagesJa : props.messagesEn;

    if (Array.isArray(messages)) {
        messages.forEach((message, index) => {
            messageElements.push(
                <div className="message" key={index}>
                    {message}
                </div>
            );
        });
    } else {
        messageElements.push(<div className="message">{messages}</div>);
    }

    return (
        <Paper elevation={2} className={alertCardClasses.root}>
            <Alert severity={props.severity} onClose={props.onClose}>
                <div className={alertCardClasses.header}>
                    <AlertTitle className={alertCardClasses.title}>
                        {props.severity[0].toUpperCase() +
                            props.severity.slice(1)}
                    </AlertTitle>
                    <div className={alertCardClasses.id}>[{props.id}]</div>
                </div>
                {messageElements}
            </Alert>
        </Paper>
    );
};

export default AlertCard;
