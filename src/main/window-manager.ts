import { App, BrowserWindow, screen } from "electron";
import * as remoteMain from "@electron/remote/main";

export class WindowManager {
  public windows = new Set<BrowserWindow>();
  private remoteMainInitialized = false;

  constructor(private readonly app: App, private readonly windowEntryPoint: string) {}

  public createWindow(): BrowserWindow {
    let window: BrowserWindow | null;

    const displaySize = screen.getPrimaryDisplay().size;

    window = new BrowserWindow({
      show: false,
      height: Math.floor((displaySize.height * 2) / 3),
      width: Math.floor((displaySize.width * 2) / 3),
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
        nativeWindowOpen: false, // if this prop is not defined an electron warning is emitted
      },
    });

    if (!this.remoteMainInitialized) {
      remoteMain.initialize();
      this.remoteMainInitialized = true;
    }

    remoteMain.enable(window.webContents);

    // Load the index.html of the app.
    window.loadURL(this.windowEntryPoint);

    window.on("ready-to-show", () => window?.show());

    window.on("closed", () => {
      if (window) this.windows.delete(window);
      window = null;
    });

    this.windows.add(window);
    return window;
  }

  public openLastWindowOrCreateNew() {
    const windows = Array.from(this.windows);

    if (windows.length > 0) {
      const window = windows[windows.length - 1];
      if (window.isMinimized()) {
        window.restore();
      }
      window.show();
      window.moveTop();
      window.focus();
    } else {
      this.createWindow();
    }
  }
}
