import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
    DecodeResult,
    decodeHRGJIS,
} from '../../components/DecodeResult/DecodeResult';
import { selectLanguage } from '../../app/languageSlice';
import { setVisibility } from '../../app/visibilitySlice';
import {
    resetDecoderState,
    setDecoderState,
    selectDecoderState,
} from './decoderSlice';
import FmMode from '../../interfaces/FmMode';
import AlertHandler from '../../components/AlertCard/AlertHandler';
import {
    errorMessageHandler,
    warningMessageHandler,
    successMessageHandler,
} from './AlertMessageHandler';
import classNames from 'classnames';
import consola from 'consola';
import {
    Button,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    TextField,
    FormControl,
    FormHelperText,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    ThemeProvider,
    Fade,
} from '@material-ui/core';
import {
    Description,
    InsertDriveFile,
    SettingsInputAntenna,
    GetApp,
} from '@material-ui/icons';
import {
    globalTheme,
    filePathFormTheme,
    fileSelectButtonTheme,
    buttonTheme,
    cardStyles,
    decoderStyles,
    fileSelectStyles,
    modeSelectStyles,
} from './decoder.style';

declare global {
    interface File {
        path: string;
    }
}

type Inputs = {
    filePath: string;
    fmMode: number;
};

const Decoder: React.FC = () => {
    const classes = {
        card: cardStyles(),
        decoder: decoderStyles(),
        fileSelect: fileSelectStyles(),
        modeSelect: modeSelectStyles(),
    };
    const { control, errors, handleSubmit, setValue } = useForm<Inputs>();
    const [shouldShowDropZone, setShouldShowDropZone] = useState(false);
    const [isInProgress, setIsInProgress] = useState(false);
    const [decodeAlert, setDecodeAlert] = useState<JSX.Element>();
    const alertHandler = new AlertHandler({
        setAlertElement: setDecodeAlert,
        errorMessageHandler: errorMessageHandler,
        warningMessageHandler: warningMessageHandler,
        successMessageHandler: successMessageHandler,
    });
    const languageState = useSelector(selectLanguage);
    const decoderState = useSelector(selectDecoderState);
    const dispatch = useDispatch();

    const language = languageState.language;
    const decodeResultHex = decoderState.decodeResultHex;
    const decodeResultChar = decoderState.decodeResultChar;

    const isWaveFile = (filepath: string): boolean => {
        if (/(\.wav)$/.test(filepath)) {
            return true;
        } else {
            return false;
        }
    };

    const setWaveFile = (filePath: string): void => {
        if (filePath !== '') {
            if (isWaveFile(filePath)) {
                setValue('filePath', filePath, { shouldValidate: true });
            } else {
                alertHandler.showAlert('Invalid file type', 'error');
            }
        }
    };

    const showDialog = () => {
        window.ipcRenderer.showDialog().then((result) => {
            setWaveFile(result);
        });
    };

    const hexToChar = (hex: string) => {
        let char = '';

        hex.split('\n')
            .filter((e) => e !== '')
            .map((data) => {
                for (let i = 0; i < data.length; i += 2) {
                    const dec = parseInt(data.substr(i, 2), 16);
                    char += decodeHRGJIS(dec);
                }

                char += '\n';
            });

        return char;
    };

    const decode = (data: Inputs) => {
        setIsInProgress(true);

        dispatch(resetDecoderState());
        alertHandler.hideAlert();

        const filePath = data.filePath;
        const modeNumber = data.fmMode;

        const baudrate = FmMode[modeNumber].baudrate;

        consola.log(
            `Attempting decode with: filePath=${filePath} modeNumber=${modeNumber} baudRate=${baudrate}`
        );

        window.ipcRenderer.getPort().then((port) => {
            const url = `http://localhost:${port}/api/decode-result?path=${filePath}&protocol=ax25&baudrate=${baudrate}`;

            fetch(url)
                .then((res) => {
                    setIsInProgress(false);

                    if (!res.ok) {
                        res.json()
                            .then((data) => {
                                throw new Error(`${data.message}`);
                            })
                            .catch((error) => {
                                consola.error(error);

                                const message = error
                                    .toString()
                                    .split('Error: ')[1];

                                alertHandler.showAlert(message, 'error');
                            });
                    } else {
                        res.text().then((resultHex) => {
                            if (!resultHex) {
                                alertHandler.showAlert('No result', 'warning');
                            }

                            const resultChar = hexToChar(resultHex);

                            window.ipcRenderer
                                .getFileName(filePath)
                                .then((fileName) => {
                                    dispatch(
                                        setDecoderState({
                                            filePath: filePath,
                                            fileName: fileName,
                                            fmMode: modeNumber,
                                            decodeResultHex: resultHex,
                                            decodeResultChar: resultChar,
                                        })
                                    );

                                    document
                                        .querySelector('#decode-result')
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                            inline: 'start',
                                        });
                                });
                        });
                    }
                })
                .catch((error) => {
                    setIsInProgress(false);

                    consola.error(error);

                    alertHandler.showAlert('Connection error', 'error');
                });
        });
    };

    const download = (decodeResultHex: string, decodeResultChar: string) => {
        const [resultHexArray, resultCharArray] = [
            decodeResultHex,
            decodeResultChar,
        ].map((str) => str.split('\n').filter((e) => e !== ''));

        const resultArray = [resultHexArray, resultCharArray];

        const tmp = resultArray[0].map((_, c) => resultArray.map((r) => r[c])); // transpose
        const data = tmp
            .map((d) => d.map((e) => `"${e.replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, data], {
            type: 'text/csv',
        });
        const link = document.createElement('a');

        link.href = window.URL.createObjectURL(blob);
        link.download = `hirogari-decoder_${decoderState.fileName}.csv`;

        link.click();
    };

    const preventDefault = (e: React.DragEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const dragLeaveEventHandler = (e: React.DragEvent) => {
        preventDefault(e);

        if (
            e.relatedTarget === null ||
            e.relatedTarget === document.querySelector('html')
        ) {
            setShouldShowDropZone(false);
        }
    };

    const dragEnterEventHandler = (e: React.DragEvent) => {
        preventDefault(e);

        if (e.dataTransfer.types.includes('Files')) {
            setShouldShowDropZone(true);
        }
    };

    const dropEventHandler = (e: React.DragEvent) => {
        preventDefault(e);

        document.querySelector('#file-select')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });

        setShouldShowDropZone(false);

        if (e.dataTransfer.types.includes('Files')) {
            setWaveFile(e.dataTransfer.files[0].path);
        }
    };

    const getText = (textJa: string, textEn: string) => {
        if (language === 'ja') {
            return textJa;
        } else {
            return textEn;
        }
    };

    const modeSelectLabels = [
        getText('通信モード番号', 'Mode Number'),
        getText('変調方式', 'Modulation Scheme'),
        getText('通信速度', 'Transmission Rate'),
        getText('プロトコル', 'Protocol'),
    ];

    const fmModeList = [
        <MenuItem
            key={-1}
            value=""
            disabled
            style={{ backgroundColor: '#fff' }}
        >
            {modeSelectLabels.map((label, index) => (
                <Typography
                    variant="overline"
                    key={index}
                    className={classes.modeSelect.item}
                >
                    {label}
                </Typography>
            ))}
        </MenuItem>,
    ];

    for (const modeNumber of Object.keys(FmMode).map((n) => Number(n))) {
        const modulation = FmMode[modeNumber].modulation;
        const baudrate = FmMode[modeNumber].baudrate;
        const protocol = FmMode[modeNumber].protocol;

        fmModeList.push(
            <MenuItem key={modeNumber} value={modeNumber}>
                {[modeNumber, modulation, baudrate, protocol].map(
                    (item, index) => (
                        <div key={index} className={classes.modeSelect.item}>
                            {item}
                        </div>
                    )
                )}
            </MenuItem>
        );
    }

    if (Object.keys(errors).length > 0) {
        consola.error('Error from form value:');
        consola.error(errors);
    }

    return (
        <div
            className={classes.decoder.root}
            onDragOver={(e) => {
                preventDefault(e);
            }}
            onDragEnter={(e) => {
                dragEnterEventHandler(e);
            }}
            onDragLeave={(e) => {
                dragLeaveEventHandler(e);
            }}
            onDrop={(e) => {
                dropEventHandler(e);
            }}
        >
            <ThemeProvider theme={globalTheme}>
                <div
                    className={classNames(classes.fileSelect.fileDropZone, {
                        [classes.fileSelect
                            .fileDropZoneHidden]: !shouldShowDropZone,
                    })}
                    onDragOver={(e) => {
                        preventDefault(e);
                    }}
                    onDragLeave={(e) => {
                        dragLeaveEventHandler(e);
                    }}
                    onDrop={(e) => {
                        dropEventHandler(e);
                    }}
                />
                <form onSubmit={handleSubmit(decode)}>
                    <Card className={classes.card.root}>
                        <CardContent
                            id="file-select"
                            className={classes.card.contents}
                        >
                            <Typography
                                variant="subtitle1"
                                component="h2"
                                color="textPrimary"
                                className={classes.card.title}
                            >
                                <InsertDriveFile
                                    className={classes.decoder.icon}
                                />
                                {getText(
                                    'WAVEファイルを選択',
                                    'Select WAVE File'
                                )}
                            </Typography>
                            <div className={classes.fileSelect.inputContents}>
                                <ThemeProvider theme={filePathFormTheme}>
                                    <Controller
                                        name="filePath"
                                        className={classes.fileSelect.input}
                                        control={control}
                                        as={
                                            <TextField
                                                label={getText(
                                                    'ファイル名',
                                                    'File Name'
                                                )}
                                                error={
                                                    errors.filePath
                                                        ? true
                                                        : false
                                                }
                                                helperText={
                                                    errors.filePath &&
                                                    getText(
                                                        'ファイルを選択してください',
                                                        'Please Select a File'
                                                    )
                                                }
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                            />
                                        }
                                        defaultValue={decoderState.filePath}
                                        rules={{
                                            required: true,
                                        }}
                                    />
                                </ThemeProvider>
                                <ThemeProvider theme={fileSelectButtonTheme}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={showDialog}
                                    >
                                        {getText(
                                            'ファイルを選択',
                                            'Select File'
                                        )}
                                    </Button>
                                </ThemeProvider>
                            </div>
                            <Typography
                                variant="overline"
                                color="textSecondary"
                            >
                                {getText(
                                    'または画面にファイルをドロップ',
                                    'Or Drop a File on the Screen'
                                )}
                            </Typography>
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
                                <SettingsInputAntenna
                                    className={classes.decoder.icon}
                                />
                                {getText(
                                    '通信モードを選択',
                                    'Select Communication Mode'
                                )}
                            </Typography>
                            <FormControl
                                className={classes.modeSelect.inputContents}
                                error={errors.fmMode ? true : false}
                            >
                                <Typography
                                    variant="overline"
                                    color={
                                        errors.fmMode
                                            ? 'error'
                                            : 'textSecondary'
                                    }
                                    className={classes.modeSelect.label}
                                >
                                    {modeSelectLabels.map((label, index) => (
                                        <div
                                            key={index}
                                            className={
                                                classes.modeSelect.labelItem
                                            }
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </Typography>
                                <Controller
                                    name="fmMode"
                                    control={control}
                                    render={({ onChange, value }) => (
                                        <Select
                                            value={value}
                                            onChange={onChange}
                                        >
                                            {fmModeList}
                                        </Select>
                                    )}
                                    defaultValue={decoderState.fmMode}
                                    rules={{ required: true }}
                                />
                                {errors.fmMode && (
                                    <FormHelperText>
                                        {getText(
                                            '通信モードを選択してください',
                                            'Please Select a Communication Mode'
                                        )}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </CardContent>
                    </Card>

                    <ThemeProvider theme={buttonTheme}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
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
                                    className={classes.decoder.progress}
                                />
                            </Fade>
                            {getText('デコード', 'Decode')}
                        </Button>
                    </ThemeProvider>
                </form>

                {decodeAlert}

                {decodeResultHex && decodeResultChar && (
                    <>
                        <Card className={classes.card.root}>
                            <CardContent
                                id="decode-result"
                                className={classes.card.contents}
                            >
                                <Typography
                                    variant="subtitle1"
                                    component="h2"
                                    color="textPrimary"
                                    className={classes.card.title}
                                >
                                    <Description
                                        className={classes.decoder.icon}
                                    />
                                    {getText('デコード結果', 'Decoded Result')}
                                    <Tooltip
                                        title={getText(
                                            'ダウンロード',
                                            'Download'
                                        )}
                                    >
                                        <IconButton
                                            className={
                                                classes.decoder
                                                    .downloadIconButton
                                            }
                                            onClick={() => {
                                                download(
                                                    decodeResultHex,
                                                    decodeResultChar
                                                );
                                            }}
                                        >
                                            <GetApp
                                                className={
                                                    classes.decoder.iconButton
                                                }
                                            />
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <DecodeResult />
                            </CardContent>
                        </Card>

                        <ThemeProvider theme={buttonTheme}>
                            <Button
                                variant="contained"
                                color="secondary"
                                type="submit"
                                onClick={() => {
                                    dispatch(setVisibility({ sendPage: true }));
                                }}
                            >
                                {getText('受信報告', 'Report This Reception')}
                            </Button>
                        </ThemeProvider>
                    </>
                )}
            </ThemeProvider>
        </div>
    );
};

export default Decoder;
