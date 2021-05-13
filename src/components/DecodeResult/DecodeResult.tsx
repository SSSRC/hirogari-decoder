import React from 'react';
import { useSelector } from 'react-redux';
import { selectDecoderState } from '../../features/Decoder/decoderSlice';
import classNames from 'classnames';
import encoding from 'encoding-japanese';
import { Typography } from '@material-ui/core';
import { decodeResultStyles } from './decodeResult.style';

interface Props {
    className?: string[];
}

const DecodeResult: React.FC<Props> = (props) => {
    const classes = {
        decodeResult: decodeResultStyles(),
    };
    const decoderState = useSelector(selectDecoderState);

    const decodeResultHex = decoderState.decodeResultHex;
    const decodeResultChar = decoderState.decodeResultChar;

    const preventDefault = (e: React.DragEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const toggleResultUnderbar = (e: React.MouseEvent, shouldShow: boolean) => {
        preventDefault(e);

        if (shouldShow) {
            e.currentTarget.classList.add(classes.decodeResult.byteHover);
        } else {
            e.currentTarget.classList.remove(classes.decodeResult.byteHover);
        }

        const parentElement = e.currentTarget.parentElement;

        if (parentElement) {
            const packetIndex = Array.from(
                document.getElementsByClassName(parentElement.className)
            ).findIndex((element) => element === parentElement);

            const byteIndex = Array.from(parentElement.children).findIndex(
                (element) => element === e.currentTarget
            );

            const target = document.querySelectorAll(
                parentElement.className.match('decode-result__packet-hex')
                    ? '.decode-result__packet-char'
                    : '.decode-result__packet-hex'
            )[packetIndex].children[byteIndex];

            if (shouldShow) {
                target.classList.add(classes.decodeResult.byteHover);
            } else {
                target.classList.remove(classes.decodeResult.byteHover);
            }
        }
    };

    const alignResultHex = (hex: string) => {
        const item: JSX.Element[] = [];

        for (let i = 0; i < hex.length; i += 2) {
            item.push(
                <div
                    key={i}
                    className={classes.decodeResult.byteHex}
                    onMouseEnter={(e) => toggleResultUnderbar(e, true)}
                    onMouseLeave={(e) => toggleResultUnderbar(e, false)}
                >
                    <div>{hex.substr(i, 2)[0]}</div>
                    <div>{hex.substr(i, 2)[1]}</div>
                </div>
            );
        }

        return item;
    };

    const alignResultChar = (char: string) => {
        const item: JSX.Element[] = [];

        for (let i = 0; i < char.length; i++) {
            const c = char[i] === ' ' ? <>&nbsp;</> : char[i];

            item.push(
                <div
                    key={i}
                    className={classes.decodeResult.byteChar}
                    onMouseEnter={(e) => toggleResultUnderbar(e, true)}
                    onMouseLeave={(e) => toggleResultUnderbar(e, false)}
                >
                    <div>{c}</div>
                </div>
            );
        }

        return item;
    };

    const getCallSign = (data: string, type: 'dest' | 'source') => {
        let callsign = '';

        for (let i = 0; i < 2 * 6; i += 2) {
            if (type === 'dest') {
                callsign += decodeHRGJIS(parseInt(data.substr(i, 2), 16) >> 1);
            } else {
                callsign += decodeHRGJIS(
                    parseInt(data.substr(i + 14, 2), 16) >> 1
                );
            }
        }

        return callsign;
    };

    let rootClassName;

    if (props.className) {
        rootClassName = classNames(
            classes.decodeResult.root,
            ...props.className
        );
    } else {
        rootClassName = classes.decodeResult.root;
    }

    return decodeResultHex && decodeResultChar ? (
        <div className={rootClassName}>
            <div className={classes.decodeResult.packetHexWrapper}>
                {decodeResultHex
                    .split('\n')
                    .filter((e) => e !== '')
                    .map((data, index) => (
                        <>
                            <Typography
                                variant="caption"
                                color="textPrimary"
                                className={classes.decodeResult.packetCaption}
                            >
                                Packet {index + 1}
                            </Typography>
                            <div className={classes.decodeResult.address}>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    className={classes.decodeResult.callsign}
                                >
                                    <div>dest</div>
                                    {getCallSign(data, 'dest')}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    className={classes.decodeResult.callsign}
                                >
                                    <div>source</div>
                                    {getCallSign(data, 'source')}
                                </Typography>
                            </div>
                            <div
                                key={index}
                                className={classNames(
                                    'decode-result__packet-hex',
                                    classes.decodeResult.packetHex
                                )}
                            >
                                {alignResultHex(data)}
                            </div>
                        </>
                    ))}
            </div>

            <div className={classes.decodeResult.packetCharWrapper}>
                {decodeResultChar
                    .split('\n')
                    .filter((e) => e !== '')
                    .map((data, index) => (
                        <div
                            key={index}
                            className={classNames(
                                'decode-result__packet-char',
                                classes.decodeResult.packetChar
                            )}
                        >
                            {alignResultChar(data)}
                        </div>
                    ))}
            </div>
        </div>
    ) : (
        <></>
    );
};

const decodeHRGJIS = (dec: number): string => {
    if (dec == 32) {
        return ' ';
    }

    if ((33 <= dec && dec <= 126) || (161 <= dec && dec <= 248)) {
        let codeArray = [dec];

        if (166 <= dec) {
            dec += 33273;

            codeArray = [dec >> 8, dec & 0xff];
        }

        return encoding.codeToString(
            encoding.convert(codeArray, {
                to: 'UNICODE',
                from: 'SJIS',
            })
        );
    }

    return '.';
};

export { DecodeResult, decodeHRGJIS };
