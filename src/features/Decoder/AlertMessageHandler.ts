export function errorMessageHandler(
    message: string
): [string, string | string[], string | string[]] {
    switch (message) {
        case 'Invalid file type':
            return [
                'ED-01',
                [
                    "選択されたファイルの拡張子が'wav'ではありません",
                    'WAVEファイルを選択してください',
                ],
                [
                    "The extension of the selected file is not 'wav'",
                    'Please select a WAVE file',
                ],
            ];
        case "Invalid URL parameter: 'mode'":
        case "Invalid URL parameter: 'modulation'":
        case "Invalid URL parameter: 'protocol'":
            return [
                'ED-02',
                '選択された通信モードの値が不正です',
                'The value of the selected communication mode is invalid',
            ];
        case 'File not found':
            return [
                'ED-03',
                '選択されたファイルが存在しません',
                'The selected file does not exist',
            ];
        case 'OS not supported':
            return [
                'ED-04',
                '本ソフトウェアはお使いのOSに対応していません',
                'This software is not compatible with your OS',
            ];
        case 'Internal Error':
            return [
                'ED-05',
                [
                    '内部エラーが発生しました',
                    'ソフトウェアの再インストールをお試しください',
                ],
                [
                    'An internal error has occurred',
                    'Please try reinstalling the software',
                ],
            ];
        case 'Connection error':
            return [
                'ED-06',
                [
                    'デコードに失敗しました',
                    'ソフトウェアの再起動をお試しください',
                ],
                ['Failed to decode', 'Please try restarting the software'],
            ];
        default:
            return [
                'ED-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}

export function warningMessageHandler(message: string): string[] {
    switch (message) {
        case 'No result':
            return ['WD-01', 'デコード結果が空です', 'Decoded result is empty'];
        default:
            return [
                'ED-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}

export function successMessageHandler(message: string): string[] {
    switch (message) {
        default:
            return [
                'ED-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}
