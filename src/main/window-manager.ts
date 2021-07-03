import { BrowserWindow, screen } from 'electron';

export class WindowManager {
    private windows = new Set<BrowserWindow>();

    constructor(private readonly windowEntryPoint: string) {
    }

    public createWindow() {
        let window: BrowserWindow | null;

        const displaySize = screen.getPrimaryDisplay().size;

        window = new BrowserWindow({
            show: false,
            height: Math.floor(displaySize.height * 2 / 3),
            width: Math.floor(displaySize.width * 2 / 3),
            frame: false,
            transparent: true,
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
