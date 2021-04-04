import { Settings } from "../../core";
import { WindowManager } from "../window-manager";

export class Header {
    constructor(public settings: Settings, public windowManager: WindowManager) {
    }

    public toggleDualPanes() {
        if (this.windowManager.panes.list.length == 1) {
            this.windowManager.panes.add();
        }
        else {
            this.windowManager.panes.list[1].close();
        }
    }
}