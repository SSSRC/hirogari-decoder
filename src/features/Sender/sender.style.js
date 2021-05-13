import { createMuiTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const globalTheme = createMuiTheme({
    typography: {
        fontFamily: "Roboto, 'Noto Sans JP', sans-serif",
    },
    overrides: {
        MuiFormControl: {
            root: {
                marginBottom: 20,
            },
        },
    },
});

const cardStyles = makeStyles({
    root: {
        margin: '10px 0',
    },
    contents: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginRight: 'auto',
        marginBottom: 6,
    },
});

const senderStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: '500px',
        minHeight: '100vh',
        padding: '0 2vw',
        backgroundColor: '#fafafa',
    },
    icon: {
        height: '1rem',
        margin: '0 5px',
    },
    decodeResult: {
        maxHeight: '50vh',
        overflow: 'auto',
    },
    buttonWrapper: {
        display: 'flex',
        marginBottom: 10,
    },
    backButton: {
        flexGrow: 1,
        marginRight: 10,
    },
    sendButton: {
        flexGrow: 2,
    },
    progressIcon: {
        position: 'absolute',
        left: 'calc(50% - 60px)',
    },
    qslCard: {
        display: 'none',
    },
});

const formStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '90%',
    },
});

export { globalTheme, cardStyles, senderStyles, formStyles };
