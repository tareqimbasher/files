import { PaneInfo } from "./pane-info";

export class Panes {
    public list: PaneInfo[] = [];
    public active!: PaneInfo;

    constructor() {
        this.setActive(this.add());
    }

    public add(): PaneInfo {
        let pane = new PaneInfo(this);
        this.list.push(pane);
        return pane;
    }

    public setActive(pane: PaneInfo) {
        if (this.active == pane)
            return;

        if (this.active)
            this.active.isActive = false;

        pane.isActive = true;
        this.active = pane;
    }
}