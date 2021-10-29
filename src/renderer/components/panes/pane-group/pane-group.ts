import { Settings } from "core";
import { WindowManager } from "../../";
import { FsItemNavigation } from "../fs-view/fs-item-navigation";

export class PaneGroup {
  private fsItemNavigation?: FsItemNavigation;
  private detaches: (() => void)[] = [];

  constructor(
    private readonly element: HTMLElement,
    public windowManager: WindowManager,
    public settings: Settings
  ) {}

  public attached() {
    this.fsItemNavigation = new FsItemNavigation(this.element, this.windowManager);
    this.fsItemNavigation.setup();
    this.detaches.push(() => this.fsItemNavigation?.dispose());
  }

  public detaching() {
    this.detaches.forEach((f) => f());
  }
}
