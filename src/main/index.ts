import { app, protocol, BrowserWindow } from 'electron';
import * as path from "path";
import { promises as fs } from 'fs';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 900,
        width: 1400,
        frame: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    const pathExists = async (p: string) => {
        try {
            await fs.access(p);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Added as a custom protocol to load files from disk
    protocol.registerFileProtocol('atom', async (request, callback) => {

        const filePath = decodeURI(request.url.substr(7));

        if (path.isAbsolute(filePath) ? await pathExists(filePath) : await pathExists(`/${filePath}`)) {
            callback(filePath);
        } else {
            callback(path.join(app.getAppPath(), '.webpack/renderer', filePath));
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    // For cross-platform solution to hide to tray:
    // https://stackoverflow.com/questions/37828758/electron-js-how-to-minimize-close-window-to-system-tray-and-restore-window-back
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
