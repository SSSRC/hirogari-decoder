const {
    app,
    Menu,
    BrowserWindow,
    ipcMain,
    dialog,
    shell,
} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const request = require('request');
const { getPort } = require('./setup');

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
                        'https://github.com/SSSRC/hirogari-decoder-beta/issues'
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

    port = (await getPort()) || port;

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

app.on('ready', createWindow);

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
