import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { DecodeResult } from '../../components/DecodeResult/DecodeResult';
import { selectLanguage } from '../../app/languageSlice';
import { setVisibility } from '../../app/visibilitySlice';
import { resetDecoderState, selectDecoderState } from '../Decoder/decoderSlice';
import FmMode from '../../interfaces/FmMode';
import AlertHandler from '../../components/AlertCard/AlertHandler';
import {
    errorMessageHandler,
    warningMessageHandler,
    successMessageHandler,
} from './AlertMessageHandler';
import {
    Button,
    TextField,
    FormHelperText,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    ThemeProvider,
    Fade,
} from '@material-ui/core';
import { ArrowBackIosOutlined, Description, Email } from '@material-ui/icons';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import {
    globalTheme,
    cardStyles,
    senderStyles,
    formStyles,
} from './sender.style';
import consola from 'consola';

type Inputs = {
    userId: string;
    timestamp: Date;
    place: string;
    fmMode: number;
    callsign: string;
    decodeResult: string;
};

const Sender: React.FC = () => {
    const classes = {
        sender: senderStyles(),
        card: cardStyles(),
        form: formStyles(),
    };
    const { control, errors, handleSubmit, getValues } = useForm<Inputs>();
    const [shouldShowQSLForm, setShouldShowQSLForm] = useState(false);
    const [isInProgress, setIsInProgress] = useState(false);
    const [sendAlert, setSendAlert] = useState<JSX.Element>();
    const alertHandler = new AlertHandler({
        setAlertElement: setSendAlert,
        errorMessageHandler: errorMessageHandler,
        warningMessageHandler: warningMessageHandler,
        successMessageHandler: successMessageHandler,
    });
    const languageState = useSelector(selectLanguage);
    const decoderState = useSelector(selectDecoderState);
    const dispatch = useDispatch();

    const language = languageState.language;

    const cardRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        document.querySelector(`.${classes.sender.root}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
        });
    }, [classes.sender.root]);

    const toTwoDigit = (n: number) => {
        return ('0' + n).slice(-2); // X -> '0X'
    };

    const toUTC = (Date: Date) => {
        const y = Date.getUTCFullYear();
        const M = toTwoDigit(Date.getUTCMonth() + 1);
        const d = toTwoDigit(Date.getUTCDate());
        const H = toTwoDigit(Date.getUTCHours());
        const m = toTwoDigit(Date.getUTCMinutes());
        const s = toTwoDigit(Date.getUTCSeconds());

        return `${y}-${M}-${d} ${H}:${m}:${s}`; // yyyy-MM-dd HH:mm:ss (UTC)
    };

    const getText = (textJa: string, textEn: string) => {
        if (language === 'ja') {
            return textJa;
        } else {
            return textEn;
        }
    };

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        setIsInProgress(true);

        if (shouldShowQSLForm) {
            downloadQSL();
        }

        const payload = {
            userId: data.userId,
            timestamp: toUTC(data.timestamp),
            receivinglocation: data.place,
            fmMode: data.fmMode,
            decodeResult: data.decodeResult,
        };

        fetch(
            'https://www.sssrc.aero.osakafu-u.ac.jp/hrg_amateur_mission_api/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            }
        )
            .then((res) => {
                setIsInProgress(false);

                consola.log(res);

                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`);
                } else {
                    alertHandler.showAlert('Send success', 'success');

                    dispatch(resetDecoderState());

                    dispatch(setVisibility({ sendPage: false }));
                }
            })
            .catch((error) => {
                setIsInProgress(false);

                consola.error(error);

                alertHandler.showAlert('Connection error', 'error');
            });
    };

    if (Object.keys(errors).length > 0) {
        consola.error(errors);
    }

    const drawText = (value: string, x_ratio: number, y_ratio: number) => {
        const canvas = cardRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        ctx.font = '34px Calibri';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';

        const x = x_ratio * canvas?.width;
        const y = y_ratio * canvas?.height;

        ctx.fillText(value, x, y);
    };

    const getFmModeText = (modeNumber: number | undefined) => {
        if (modeNumber === undefined) {
            return '';
        }

        const modulation = FmMode[modeNumber].modulation;
        const baudrate = FmMode[modeNumber].baudrate;
        const protocol = FmMode[modeNumber].protocol;

        return `${modulation} ${baudrate}bps ${protocol}`;
    };

    const downloadQSL = () => {
        const image = new Image();

        image.src = '../assets/HIROGARI_QSL.png';

        image.onload = () => {
            const canvas = cardRef.current;
            const ctx = canvas?.getContext('2d');

            if (!canvas || !ctx) return;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // init
            ctx.drawImage(image, 0, 0);

            const timestamp = getValues('timestamp');
            const [y, M, d, H, m] = toUTC(timestamp).split(/[- :]/);

            drawText(getValues('callsign'), 0.7, 0.347);
            drawText(`${y}. ${M}. ${d}`, 0.69, 0.448);
            drawText(`${H}:${m} (UTC)`, 0.69, 0.497);
            drawText(getFmModeText(getValues('fmMode')), 0.7, 0.644);

            const link = document.createElement('a');

            link.href = canvas.toDataURL('image/png');
            link.download = 'hirogari_qslcard.png';
            link.click();
        };
    };

    return (
        <div className={classes.sender.root}>
            <ThemeProvider theme={globalTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card className={classes.card.root}>
                        <CardContent className={classes.card.contents}>
                            <Typography
                                variant="subtitle1"
                                component="h2"
                                color="textPrimary"
                                className={classes.card.title}
                            >
                                <Email className={classes.sender.icon} />
                                {getText(
                                    '受信報告フォーム',
                                    'Reception Report Form'
                                )}
                            </Typography>
                            <div className={classes.form.root}>
                                <Controller
                                    name="userId"
                                    control={control}
                                    as={
                                        <TextField
                                            label={getText(
                                                '観測者名',
                                                'Observer Name'
                                            )}
                                            autoComplete="nickname"
                                            error={errors.userId ? true : false}
                                            helperText={errors.userId?.message}
                                            required
                                            autoFocus
                                        />
                                    }
                                    defaultValue=""
                                    rules={{
                                        required: true,
                                        maxLength: {
                                            value: 30,
                                            message: getText(
                                                '30文字以内で入力してください',
                                                'Please enter 20 characters or less'
                                            ),
                                        },
                                    }}
                                />
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <Controller
                                        name="timestamp"
                                        control={control}
                                        render={({ onChange, value }) => (
                                            <DateTimePicker
                                                label={getText(
                                                    '受信日時',
                                                    'Date and Time Received'
                                                )}
                                                inputVariant="standard"
                                                value={value}
                                                onChange={onChange}
                                                error={
                                                    errors.timestamp
                                                        ? true
                                                        : false
                                                }
                                                helperText={
                                                    errors.timestamp?.message
                                                }
                                                required
                                                disableFuture
                                                showTodayButton
                                            />
                                        )}
                                        defaultValue={new Date()}
                                        rules={{
                                            required: true,
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                                <Controller
                                    name="place"
                                    control={control}
                                    as={
                                        <TextField
                                            label={getText(
                                                '受信場所',
                                                'Place Received'
                                            )}
                                            autoComplete="address-level1"
                                            error={errors.place ? true : false}
                                            helperText={errors.place?.message}
                                        />
                                    }
                                    defaultValue=""
                                    rules={{
                                        maxLength: {
                                            value: 100,
                                            message: getText(
                                                '100文字以内で入力してください',
                                                'Please enter 100 characters or less'
                                            ),
                                        },
                                    }}
                                />
                                <Controller
                                    name="fmMode"
                                    control={control}
                                    render={() => (
                                        <TextField
                                            label={getText(
                                                '通信モード',
                                                'Communication Mode'
                                            )}
                                            value={getFmModeText(
                                                decoderState.fmMode
                                            )}
                                            error={errors.fmMode ? true : false}
                                            helperText={errors.fmMode?.message}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    )}
                                    defaultValue={decoderState.fmMode}
                                    rules={{
                                        required: true,
                                    }}
                                />

                                <FormControlLabel
                                    control={<Checkbox color="primary" />}
                                    label={getText(
                                        'QSLカードを希望しますか?',
                                        'Would you like a QSL card?'
                                    )}
                                    labelPlacement="end"
                                    onChange={() => {
                                        setShouldShowQSLForm(
                                            !shouldShowQSLForm
                                        );
                                    }}
                                />

                                {shouldShowQSLForm && (
                                    <>
                                        <Controller
                                            name="callsign"
                                            control={control}
                                            as={
                                                <TextField
                                                    label={getText(
                                                        'コールサイン',
                                                        'Call Sign'
                                                    )}
                                                    autoComplete="nickname"
                                                    error={
                                                        errors.callsign
                                                            ? true
                                                            : false
                                                    }
                                                    helperText={
                                                        errors.callsign?.message
                                                    }
                                                    required
                                                    autoFocus
                                                />
                                            }
                                            defaultValue=""
                                            rules={{
                                                required: true,
                                                maxLength: {
                                                    value: 20,
                                                    message: getText(
                                                        '20文字以内で入力してください',
                                                        'Please enter 20 characters or less'
                                                    ),
                                                },
                                            }}
                                        />
                                        <canvas
                                            className={classes.sender.qslCard}
                                            ref={cardRef}
                                        ></canvas>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={classes.card.root}>
                        <CardContent className={classes.card.contents}>
                            <Typography
                                variant="subtitle1"
                                component="h2"
                                color="textPrimary"
                                className={classes.card.title}
                            >
                                <Description className={classes.sender.icon} />
                                {getText('デコード結果', 'Decoded Result')}
                            </Typography>
                            <Controller
                                name="decodeResult"
                                control={control}
                                render={() => (
                                    <DecodeResult
                                        className={[
                                            classes.sender.decodeResult,
                                        ]}
                                    />
                                )}
                                defaultValue={decoderState.decodeResultHex}
                                rules={{
                                    required: true,
                                }}
                            />
                            {errors.decodeResult && (
                                <FormHelperText error>
                                    {getText('送信できません', 'Cannot send')}
                                    <br />
                                    {getText(
                                        'デコード結果が空です',
                                        'Decoded Result is empty'
                                    )}
                                </FormHelperText>
                            )}
                        </CardContent>
                    </Card>

                    <div className={classes.sender.buttonWrapper}>
                        <Button
                            variant="contained"
                            color="default"
                            className={classes.sender.backButton}
                            onClick={() => {
                                dispatch(setVisibility({ sendPage: false }));
                            }}
                        >
                            <ArrowBackIosOutlined
                                className={classes.sender.icon}
                            />
                            {getText('戻る', 'Back')}
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            className={classes.sender.sendButton}
                        >
                            <Fade
                                in={isInProgress}
                                style={{
                                    transitionDelay: isInProgress
                                        ? '800ms'
                                        : '0ms',
                                }}
                                unmountOnExit
                            >
                                <CircularProgress
                                    size="1rem"
                                    color="inherit"
                                    className={classes.sender.progressIcon}
                                />
                            </Fade>
                            {getText('送信', 'Send')}
                        </Button>
                    </div>
                </form>

                {sendAlert}
            </ThemeProvider>
        </div>
    );
};

export default Sender;
