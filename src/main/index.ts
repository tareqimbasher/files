import { app, BrowserWindow, nativeImage, Tray, Menu } from 'electron';
import { registerProtocols } from './protocols';
import { WindowManager } from './window-manager';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Only run single instance app mode in production builds
const singleInstanceApp = app.commandLine.hasSwitch("dev") !== true;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

if (singleInstanceApp && !app.requestSingleInstanceLock()) {
    app.quit();
}


const windowManager = new WindowManager(MAIN_WINDOW_WEBPACK_ENTRY);


app.on('ready', (event, launchInfo) => {
    // Without a timeout, transparency does not seem to work
    setTimeout(() => {
        windowManager.createWindow();
    }, 10);
    registerProtocols(app);
});

// For OSX
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createWindow();
    }
});

if (singleInstanceApp) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        windowManager.createWindow();
    });

    app.on("will-quit", event => {
        event.preventDefault();
    });
}

app.on('window-all-closed', () => {
    if (!singleInstanceApp) {
        if (process.platform !== 'darwin') {
            app.quit();
        }

        // For cross-platform solution to hide to tray:
        // https://stackoverflow.com/questions/37828758/electron-js-how-to-minimize-close-window-to-system-tray-and-restore-window-back
    }
});
