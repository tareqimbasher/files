import { BrowserWindow } from 'electron';

export class WindowManager {
    private windows = new Set<BrowserWindow>();

    constructor(private readonly windowEntryPoint: string) {

    }

    public createWindow() {
        let window: BrowserWindow | null;

        window = new BrowserWindow({
            show: false,
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

        // Load the index.html of the app.
        window.loadURL(this.windowEntryPoint);

        window.on('ready-to-show', () => window?.show());

        window.on('closed', () => {
            if (!!window)
                this.windows.delete(window);
            window = null;
        });

        return window;
    }
}
