import { Settings } from "../../../core";
import { WindowManager } from "../../";
import { Pane } from "../pane";

export class PaneGroup {
    public panes: Pane[] = [];

    constructor(public windowManager: WindowManager, public settings: Settings) {
    }
}
