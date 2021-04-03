import { Pane } from "./pane";

export class Panes {
    public list: Pane[] = [];
    public active!: Pane;

    constructor() {
        this.setActive(this.add());
    }

    public add(): Pane {
        let pane = new Pane(this);
        this.list.push(pane);
        return pane;
    }

    public setActive(pane: Pane) {
        if (this.active == pane)
            return;

        if (this.active)
            this.active.isActive = false;

        pane.isActive = true;
        this.active = pane;
    }
}