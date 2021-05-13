import { makeStyles } from '@material-ui/core/styles';

const decodeResultStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontFamily: "Inconsolata, 'Noto Sans JP'",
    },
    packetHexWrapper: {
        display: 'flex',
        flex: 1.2,
        flexDirection: 'column',
        marginRight: 10,
    },
    packetCharWrapper: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
    },
    packetHex: {
        marginBottom: 10,
        color: '#1b5e20',
    },
    packetChar: {
        marginTop: 42,
        marginBottom: 10,
        color: '#1b5e20',
    },
    packetCaption: {
        display: 'inline-flex',
        height: 20,
    },
    address: {
        display: 'inline-flex',
        height: 20,
        marginBottom: 2,
    },
    callsign: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 120,

        '& div': {
            width: 45,
        },
    },
    byteHex: {
        display: 'inline-flex',
        justifyContent: 'space-around',
        width: '1.2rem',
        lineHeight: '17px',
        marginRight: 5 * 1.2,
        marginBottom: 1,
        fontSize: 17,
    },
    byteChar: {
        display: 'inline-flex',
        justifyContent: 'space-around',
        width: '1rem',
        lineHeight: '17px',
        marginRight: 5,
        marginBottom: 1,
        fontSize: 17,
    },
    byteHover: {
        marginBottom: 0,
        borderBottom: '1px solid #1b5e20',
    },
});

export { decodeResultStyles };
