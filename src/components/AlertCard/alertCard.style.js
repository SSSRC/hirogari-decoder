import { makeStyles } from '@material-ui/core/styles';

const alertCardStyles = makeStyles({
    root: {
        position: 'fixed',
        bottom: 6,
        left: 6,
        width: 'max-content',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
    },
    title: {
        marginRight: '0.8rem',
    },
    id: {
        fontSize: '0.8rem',
        marginTop: -2,
        marginBottom: '0.35em',
    },
});

export { alertCardStyles };
