import { bindable, EventAggregator } from "aurelia";
import { Settings } from "../../core";
import { PaneInfo } from "./pane-info";


export class Pane {
    @bindable public info!: PaneInfo;

    constructor(public settings: Settings, private eventBus: EventAggregator) {
    }

    public attached() {
        this.info.tabs.refreshTabBinding();
    }
}
