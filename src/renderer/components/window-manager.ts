import { singleton } from "aurelia";
import { system } from "../core";
import { Panes } from "./panes/panes";

@singleton()
export class WindowManager {
  private window: Electron.BrowserWindow;

  constructor(public panes: Panes) {
    this.window = system.remote.getCurrentWindow();
  }

  close() {
    this.window.close();
  }

  minimize() {
    this.window.minimize();
  }

  maximize() {
    if (this.window.isMaximized()) this.window.restore();
    else this.window.maximize();
  }
}
