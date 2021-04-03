import { bindable, EventAggregator } from "aurelia";
import { Settings } from "../../../core";
import { Pane } from "../pane";


export class PaneView {
    @bindable public pane!: Pane;

    constructor(public settings: Settings, private eventBus: EventAggregator) {
    }

    public attached() {
        this.pane.tabs.refreshTabBinding();
    }
}