import { createMuiTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const globalTheme = createMuiTheme({
    typography: {
        fontFamily: "Roboto, 'Noto Sans JP', sans-serif",
    },
});

const filePathFormTheme = createMuiTheme({
    overrides: {
        MuiFormControl: {
            root: {
                marginRight: 6,
            },
        },
    },
});

const fileSelectButtonTheme = createMuiTheme({
    overrides: {
        MuiButton: {
            outlinedSizeSmall: {
                paddingTop: 12,
                paddingBottom: 12,
            },
        },
    },
});

const buttonTheme = createMuiTheme({
    overrides: {
        MuiButtonBase: {
            root: {
                width: '100%',
                marginBottom: 10,
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

const decoderStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: '500px',
        minHeight: '100vh',
        padding: '0 2vw',
        backgroundColor: '#fafafa',
    },
    progress: {
        position: 'absolute',
        left: 'calc(50% - 60px)',
    },
    icon: {
        height: '1rem',
        margin: '0 5px',
    },
    iconButton: {
        width: '1rem',
        height: '1rem',
    },
    downloadIconButton: {
        marginLeft: 'auto',
    },
});

const fileSelectStyles = makeStyles({
    inputContents: {
        display: 'flex',
        width: '90%',
        alignItems: 'flex-start',
    },
    input: {
        flexGrow: 1,
    },
    fileDropZone: {
        display: 'block',
        position: 'fixed',
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1565c0',
        opacity: 0.4,
        zIndex: 10,
    },
    fileDropZoneHidden: {
        display: 'none',
    },
});

const modeSelectStyles = makeStyles({
    inputContents: {
        width: '90%',
    },
    label: {
        paddingRight: 24,
    },
    labelItem: {
        display: 'inline-block',
        width: '25%',
        textAlign: 'center',
    },
    item: {
        display: 'inline-block',
        width: '25%',
        textAlign: 'center',
    },
});

export {
    globalTheme,
    filePathFormTheme,
    fileSelectButtonTheme,
    buttonTheme,
    cardStyles,
    decoderStyles,
    fileSelectStyles,
    modeSelectStyles,
};
