import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IpcRendererEvent } from 'electron';
import Decoder from '../features/Decoder/Decoder';
import Sender from '../features/Sender/Sender';
import { setLanguage } from './languageSlice';
import { selectVisibility } from './visibilitySlice';

type Listener = (e: IpcRendererEvent, arg: boolean) => void;

interface IpcRenderer {
    sendLog: (...args: unknown[]) => void;
    addLocaleListener: (listener: Listener) => void;
    removeLocaleListener: () => void;
    getPort: () => Promise<string>;
    getFileName: (filePath: string) => Promise<string>;
    showDialog: () => Promise<string>;
}

declare global {
    interface Window {
        ipcRenderer: IpcRenderer;
    }
}

const App: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        window.ipcRenderer.addLocaleListener((e, isJapanese) => {
            if (isJapanese) {
                dispatch(setLanguage('ja'));
            } else {
                dispatch(setLanguage('en'));
            }
        });

        return () => {
            window.ipcRenderer.removeLocaleListener();
        };
    });

    const visibility = useSelector(selectVisibility);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [visibility.sendPage]);

    return (
        <div className="App">
            {visibility.sendPage === false ? <Decoder /> : <Sender />}
        </div>
    );
};

export default App;
