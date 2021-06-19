const {
    app,
    Menu,
    BrowserWindow,
    ipcMain,
    dialog,
    shell,
} = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const childProcess = require('child_process');
const request = require('request');
const consola = require('consola');
const { getPort } = require('./setup');
const package = require('../package.json');

// Logs that is not
const logPool = [];
let logFileStream;

// Set log level
consola.level = consola.LogLevel.Trace;

/** Write object to logFileStream */
const writeLog = (logObj) => {
    const write = (data) => {
        const { date, type, args } = data;
        const argsStr = args
            .map((arg) => {
                if (typeof arg === 'string') return arg;
                else if (typeof arg === 'number') return arg.toString();
                else return JSON.stringify(arg);
            })
            .join(' ');
        const dateStr = date.toISOString ? date.toISOString() : date.toString();
        logFileStream.write(`${dateStr} [${type}] ${argsStr}\n`);
    };

    if (logFileStream && logFileStream.writable) {
        // Flush logPool
        for (const log of logPool) {
            write(log);
        }
        logPool.length = 0;

        // Write given data
        write(logObj);
        // If logStream is not ready
    } else {
        logPool.push(logObj);
    }
};

consola.addReporter({
    log: (logObj) => {
        writeLog(logObj);
    },
});

let mainWindow = null;
let isJapanese = 0;

const platform = process.platform;
const isMac = platform === 'darwin';
const isDevelopment = process.env.NODE_ENV?.trim() === 'development';

app.setName('HIROGARI Decoder');

app.setAboutPanelOptions({
    applicationName: app.name,
    applicationVersion: `Version ${app.getVersion()}`,
    copyright: 'Copyright © 2021 SSSRC',
    iconPath: path.join(__dirname, '../assets/icon256x256.png'),
});

const template = [
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      { role: 'hide' },
                      { role: 'hideothers' },
                      { role: 'unhide' },
                      { type: 'separator' },
                      { role: 'quit' },
                  ],
              },
          ]
        : []),
    {
        label: 'File',
        submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' },
        ],
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            ...(isMac
                ? [
                      { type: 'separator' },
                      { role: 'front' },
                      { type: 'separator' },
                      { role: 'window' },
                  ]
                : [{ role: 'close' }]),
        ],
    },
    {
        role: 'Help',
        submenu: [
            { role: 'about' },
            {
                label: 'Language',
                click: () => {
                    isJapanese = dialog.showMessageBoxSync(mainWindow, {
                        type: 'none',
                        message: 'Select Language',
                        buttons: ['English', '日本語'],
                        defaultId: isJapanese,
                        cancelId: isJapanese,
                    });

                    mainWindow.webContents.send('get-locale', isJapanese);
                },
            },
            {
                label: 'Learn More',
                click: async () => {
                    await shell.openExternal(
                        'https://www.sssrc.aero.osakafu-u.ac.jp/hrg_amateur_mission/#/'
                    );
                },
            },
            {
                label: 'Donate',
                click: async () => {
                    await shell.openExternal(
                        'https://www.sssrc.aero.osakafu-u.ac.jp/%e3%81%94%e5%af%84%e4%bb%98%e3%81%ae%e3%81%8a%e9%a1%98%e3%81%84/'
                    );
                },
            },
            {
                label: 'Report a bug',
                click: async () => {
                    await shell.openExternal(
                        'https://github.com/SSSRC/hirogari-decoder/issues'
                    );
                },
            },
        ],
    },
];

const menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(menu);

let port = '8080';

async function createWindow() {
    if (!['win32', 'linux', 'darwin'].includes(platform)) {
        dialog.showErrorBox(
            'Unsupported Operating System',
            'Sorry, this operating system is not supported.\nApp will exit.'
        );
        consola.fatal(`Unsupported OS: ${platform}`);

        app.exit();
    }

    mainWindow = new BrowserWindow({
        width: 700,
        height: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.js'),
        },
        icon: path.join(__dirname, '../assets/icon256x256.png'),
    });

    mainWindow.loadURL('file:' + path.join(__dirname, '../build/index.html'));

    const proc = childProcess.spawn(`./server`, [port], {
        cwd: isDevelopment
            ? path.join(__dirname, `../decoder/build/${platform}`)
            : path.join(process.resourcesPath, `./decoder/build/${platform}`),
    });

    mainWindow.webContents.on('did-finish-load', () => {
        isJapanese = app.getLocale() === 'ja' ? 1 : 0;

        mainWindow.webContents.send('get-locale', isJapanese);
    });

    mainWindow.on('close', () => {
        request(
            {
                url: `http://localhost:${port}/close`,
                method: 'GET',
            },
            () => {
                proc.kill();
            }
        );
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    port = (await getPort()) || port;
    await setupLog();
    createWindow();
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('get-port', () => {
    return port;
});

ipcMain.handle('get-filename', (e, filePath) => {
    return path.basename(filePath, path.extname(filePath));
});

ipcMain.handle('show-dialog', async () => {
    const result = await dialog.showOpenDialog({
        filters: [{ name: 'Wave Files', extensions: ['wav'] }],
        properties: ['openFile'],
    });

    if (result.canceled) {
        return '';
    }

    const filePath = result.filePaths[0];

    return filePath;
});

// Logfile export
const setupLog = async () => {
    const logFileName =
        'log_' + new Date().toISOString().replace(/[^0-9]/g, '') + '.log';
    const logFileDir = path.resolve(app.getPath('userData'), 'logs');
    const logFilePath = path.join(logFileDir, logFileName);

    // Create log directory
    await fsp.mkdir(logFileDir, { recursive: true });

    // Create stream
    logFileStream = fs.createWriteStream(logFilePath);
    logFileStream.write(logFileName + '\n');

    consola.log(`Logfile: ${logFilePath}`);
    consola.debug(`Package info`, {
        name: package.name,
        version: package.version,
    });
    consola.debug(`System info`, {
        arch: os.arch(),
        cpus: os.cpus(),
        freemem: os.freemem(),
        platform: os.platform(),
        version: os.version(),
    });

    ipcMain.on('log', (_, __, logObj) => {
        writeLog(logObj);
    });

    app.on('will-quit', () => {
        consola.log(`Gracefully ended by will-quit event.\n`);
        logFileStream.end();
    });
};

// Handle unhandleRejection
process.on('unhandledRejection', (reason, promise) => {
    consola.warn(reason);
    consola.warn(promise);
});
