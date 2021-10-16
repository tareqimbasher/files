import { IContainer, singleton } from "aurelia";
import { Pane } from "./pane";

@singleton()
export class Panes {
    public list: Pane[] = [];
    public active!: Pane;

    constructor(@IContainer private container: IContainer) {
        this.setActive(this.add());
    }

    public add(): Pane {
        let pane = new Pane(this, this.container);
        this.list.push(pane);
        return pane;
    }

    public remove(pane: Pane) {
        if (this.list.length == 1)
            return;

        try {
            let ix = this.list.indexOf(pane);

            let newActive: Pane;
            if (this.list.length > 1) {
                newActive = ix == 0 ? this.list[1] : this.list[ix - 1];
                this.setActive(newActive);
            }

            this.list = this.list.filter((tab, index) => index != ix);

        } finally {
            pane.dispose();
        }
    }

    public toggleDualPanes() {
        if (this.list.length == 1) {
            this.add();
        }
        else {
            this.list[1].close();
        }
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