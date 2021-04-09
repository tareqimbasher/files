import { FileService, Util } from "../../core";
import { Panes } from "./panes";
import { Tabs } from "./tabs/tabs";

export class Pane {
    public id: string;
    public isActive: boolean = false;
    public tabs: Tabs;

    constructor(public panes: Panes, private fileService: FileService) {
        this.id = Util.newGuid();
        this.tabs = new Tabs(this, fileService);
    }

    public activate() {
        this.panes.setActive(this);
    }

    public close() {
        this.panes.remove(this);
    }
}