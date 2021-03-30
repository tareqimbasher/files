import { Settings } from "../../core";
import { WindowManager } from "../";
import { PaneInfo } from "./pane-info";

export class PaneGroup {
    public panes: PaneInfo[] = [];

    constructor(public windowManager: WindowManager, public settings: Settings) {
    }
}
