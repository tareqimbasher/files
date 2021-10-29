import { watch } from "aurelia";
import { Settings } from "core";
import { WindowManager } from "../";
import { Clipboard } from "../common";

export class StatusBar {
  public allFsItemsCount = 0;
  public selectedFsItemsCount = 0;
  public selectedFsItemsSize? = 0;
  public showClipboard = false;

  constructor(
    private readonly settings: Settings,
    private readonly windowManager: WindowManager,
    private readonly clipboard: Clipboard
  ) {}

  @watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active.fsItems.view.length)
  @watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active.fsItems.selected.length)
  private updateCounts() {
    this.allFsItemsCount = this.windowManager.panes.active.tabs.active.fsItems.view.length;
    this.selectedFsItemsCount = this.windowManager.panes.active.tabs.active.fsItems.selected.length;
    if (!this.windowManager.panes.active.tabs.active.fsItems.selected.every((x) => x.isDir))
      this.selectedFsItemsSize =
        this.windowManager.panes.active.tabs.active.fsItems.selected.reduce(
          (p, n) => (p += n.size),
          0
        );
    else this.selectedFsItemsSize = undefined;
  }
}
