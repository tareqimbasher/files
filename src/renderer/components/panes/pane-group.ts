import { Pane } from "./pane";

export class PaneGroup {
    public panes: Pane[] = [];

    constructor() {
        this.panes.push(new Pane(), new Pane());
    }
}