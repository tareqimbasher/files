import { Settings } from "../../core";
import { PaneManager } from "./pane-manager";
import { PaneInfo } from "./pane-info";

export class PaneGroup {
    public panes: PaneInfo[] = [];

    constructor(public paneManager: PaneManager, public settings: Settings) {
        this.paneManager.panes.push(
            new PaneInfo(),
            new PaneInfo()
        );

        this.paneManager.panes[0].addTab("C:/");
        this.paneManager.panes[0].addTab("C:/tmp");

        this.paneManager.panes[1].addTab("C:/");
        this.paneManager.panes[1].addTab("C:/Program Files");
    }
}

