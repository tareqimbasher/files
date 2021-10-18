import { app, BrowserWindow } from "electron";
import { EnvironmentManager } from "./environment-manager";
import { IpcEventBus } from "./ipc/ipc-event-bus";
import { registerProtocols } from "./protocols";
import { DriveService } from "./services/drive-service";
import { TrayAndDockManager } from "./tray-and-dock-manager";
import { WindowManager } from "./window-manager";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Only run single instance app mode in production builds
const singleInstanceApp = !app.commandLine.hasSwitch("dev");
if (singleInstanceApp && !app.requestSingleInstanceLock()) {
  app.quit();
}

const windowManager = new WindowManager(app, MAIN_WINDOW_WEBPACK_ENTRY);
const trayAndDockManager = new TrayAndDockManager(app, windowManager);
const environmentManager = new EnvironmentManager(windowManager);
const eventBus = new IpcEventBus(windowManager);
const driveService = new DriveService(eventBus);

// For transparency to function correctly on linux
if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-transparent-visuals");
  app.disableHardwareAcceleration();
}

app.on("ready", (event, launchInfo) => {
  // Without a timeout, transparency does not seem to work
  setTimeout(() => {
    windowManager.createWindow();
  }, 10);

  registerProtocols(app);
  trayAndDockManager.setup();
  environmentManager.setup();
  driveService.start();
});

app.on("activate", () => {
  // For OSX
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createWindow();
  }
});

if (singleInstanceApp) {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    windowManager.createWindow();
  });
}

app.on("window-all-closed", () => {
  if (!singleInstanceApp) {
    if (process.platform !== "darwin") {
      app.quit();
    }

    // For cross-platform solution to hide to tray:
    // https://stackoverflow.com/questions/37828758/electron-js-how-to-minimize-close-window-to-system-tray-and-restore-window-back
  }
});

app.on("quit", (event, exitCode) => {
  driveService.stop();
});
