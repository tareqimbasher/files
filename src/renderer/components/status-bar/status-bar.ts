import { watch } from "aurelia";
import { FileSystemItem, Settings } from "../../core";
import { WindowManager } from "../";

export class StatusBar {

    public allFsItemsCount = 0;
    public selectedFsItemsCount = 0;

    constructor(public settings: Settings, public windowManager: WindowManager) {
    }

    @watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active.fsItems.values.length)
    @watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active.fsItems.selected.length)
    private updateCounts() {
        this.allFsItemsCount = this.windowManager.panes.active.tabs.active.fsItems.values.length;
        this.selectedFsItemsCount = this.windowManager.panes.active.tabs.active.fsItems.selected.length;
    }
}