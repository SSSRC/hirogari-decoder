export function errorMessageHandler(
    message: string
): [string, string | string[], string | string[]] {
    switch (message) {
        case 'Connection error':
            return [
                'ES-01',
                ['送信に失敗しました', 'ネットワークの状態をご確認ください'],
                ['Failed to send', 'Please check the network status'],
            ];
        default:
            return [
                'ES-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}

export function warningMessageHandler(message: string): string[] {
    switch (message) {
        default:
            return [
                'ES-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}

export function successMessageHandler(message: string): string[] {
    switch (message) {
        case 'Send success':
            return ['SS-01', '送信に成功しました', 'Succeeded in sending'];
        default:
            return [
                'ES-00',
                '不明なエラーが発生しました',
                'An unknown error has occurred',
            ];
    }
}
