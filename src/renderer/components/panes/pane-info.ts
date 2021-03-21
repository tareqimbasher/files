import { Util } from "../../core";
import { Panes } from "./panes";
import { Tabs } from "./tabs/tabs";

export class PaneInfo {
    public id: string;
    public isActive: boolean = false;
    public tabs: Tabs;

    constructor(public panes: Panes) {
        this.id = Util.newGuid();
        this.tabs = new Tabs(this);
    }

    public activate() {
        this.panes.setActive(this);
    }
}
