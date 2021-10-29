import { IEventAggregator, singleton } from "aurelia";
import { system, ViewCommandToggleSidebar } from "common";
import { Panes } from "./panes/panes";
import { Sidebar } from "./sidebar/sidebar";
import { StatusBar } from "./status-bar/status-bar";
import { Header } from "./header/header";

@singleton()
export class WindowManager {
  public isWindowPinned: boolean;
  private window: Electron.BrowserWindow;
  private sidebar?: Sidebar;
  private statusBar?: StatusBar;
  private header?: Header;

  constructor(public panes: Panes, @IEventAggregator private readonly eventBus: IEventAggregator) {
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

  public toggleSidebar() {
    this.eventBus.publish(new ViewCommandToggleSidebar());
  }

  public setHeader(header: Header) {
    this.header = header;
  }

  public setSidebar(sideBar: Sidebar) {
    this.sidebar = sideBar;
  }

  public setStatusBar(statusBar: StatusBar) {
    this.statusBar = statusBar;
  }
}
