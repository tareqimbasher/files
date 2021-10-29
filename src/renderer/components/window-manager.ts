import { singleton } from "aurelia";
import { system } from "../core";
import { Panes } from "./panes/panes";

@singleton()
export class WindowManager {
  public isWindowPinned: boolean;
  private window: Electron.BrowserWindow;

  constructor(public panes: Panes) {
    this.window = system.remote.getCurrentWindow();
    this.isWindowPinned = this.window.isAlwaysOnTop();
  }

  public close() {
    this.window.close();
  }

  public minimize() {
    this.window.minimize();
  }

  public maximize() {
    if (this.window.isMaximized()) this.window.restore();
    else this.window.maximize();
  }

  public togglePinWindow() {
    this.window.setAlwaysOnTop(!this.isWindowPinned);
    this.isWindowPinned = this.window.isAlwaysOnTop();
  }
}
