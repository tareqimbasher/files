import { Settings } from "../../core";
import { Pane } from "./pane";

export class PaneGroup {
    public panes: Pane[] = [];

    constructor(public settings: Settings) {
        this.panes.push(
            new Pane(settings),
            new Pane(settings)
        );
    }
}