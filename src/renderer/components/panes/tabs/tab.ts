import { bindable } from "aurelia";
import { Util } from "../../../core";
import { PaneInfo } from "../pane-info";
import { TabInfo } from "./tab-info";

export class Tab {

    public id: string;

    @bindable public pane!: PaneInfo;
    @bindable public info!: TabInfo;

    constructor() {
        this.id = Util.newGuid();
    }
}