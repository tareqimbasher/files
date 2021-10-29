import { Profile, Settings } from "application";
import { IpcEventBus } from "../services/ipc-event-bus";
import { WindowManager } from "./window-manager";
import { ShortcutManager } from "@domain";

export class Window {
  constructor(
    private profile: Profile,
    private settings: Settings,
    private windowManager: WindowManager,
    private ipcEventBus: IpcEventBus,
    private shortcutManager: ShortcutManager
  ) {
    profile.load();
  }

  public attached() {
    this.setupSidebarResizing();
    this.setupPaneResizing();
    this.shortcutManager.setupKeyboardShortcuts();
  }

  private setupSidebarResizing() {
    const sidebar = document.getElementsByTagName("sidebar")[0] as HTMLElement;
    const paneGroup = document.getElementsByTagName("pane-group")[0] as HTMLElement;
    this.setupResizing(sidebar, paneGroup);
  }

  private setupPaneResizing() {
    const panes = document.getElementsByTagName("pane-view");
    if (panes.length != 2) return;

    this.setupResizing(panes[0] as HTMLElement, panes[1] as HTMLElement);
    return;
  }

  private setupResizing(leftElement: HTMLElement, rightElement: HTMLElement) {
    let mousePosition: number;

    const resize = (ev: MouseEvent) => {
      // If mouse is not clicked
      if (ev.which == 0) {
        document.removeEventListener("mousemove", resize);
        return;
      }

      const dx = mousePosition - ev.x;
      mousePosition = ev.x;

      let rightElementWidth = parseInt(getComputedStyle(rightElement, "").width);
      (parseInt(getComputedStyle(rightElement, ":before")?.width) || 0) +
        (parseInt(getComputedStyle(rightElement, ":after")?.width) || 0);

      let leftElementWidth = parseInt(getComputedStyle(leftElement, "").width);
      (parseInt(getComputedStyle(leftElement, ":before")?.width) || 0) +
        (parseInt(getComputedStyle(leftElement, ":after")?.width) || 0);

      rightElementWidth += dx;
      leftElementWidth -= dx;

      rightElement.style.flex = "1 " + rightElementWidth + "px";
      leftElement.style.flex = "1 " + leftElementWidth + "px";
    };

    rightElement.addEventListener("mousedown", (ev) => {
      if (ev.target == rightElement && ev.offsetX < 10) {
        mousePosition = ev.x;
        document.addEventListener("mousemove", resize);
      }
    });

    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resize);
    });
  }
}
