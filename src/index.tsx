import React from 'react';
import ReactDOM from 'react-dom';
import consola, {
    ConsolaReporter,
    ConsolaReporterLogObject,
    LogLevel,
} from 'consola';
import App from './app/App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

/** Report logs to main process */
class IPCReporter implements ConsolaReporter {
    log(logObj: ConsolaReporterLogObject) {
        try {
            // Transport via IPC
            window.ipcRenderer.sendLog('log', logObj);
        } catch (_) {
            // In case of that logObj contains some special objects
            consola.warn(`Some logs cannot be transported via IPC.`);
        }
    }
}

// Collect logs from consola globally
consola.addReporter(new IPCReporter());

// Set log level
consola.level = LogLevel.Trace;

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
