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
    const pane = new Pane(this, this.container);
    this.list.push(pane);
    return pane;
  }

  public remove(pane: Pane) {
    if (this.list.length == 1) return;

    try {
      const ix = this.list.indexOf(pane);

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
      this.add().activate();
    } else {
      this.list[1].close();
    }
  }

  public setActive(pane: Pane) {
    if (this.active == pane) return;

    if (this.active) this.active.isActive = false;

    pane.isActive = true;
    this.active = pane;

    const panesEls = document.querySelectorAll(`pane-view[data-id="${pane.id}"] fs-view`);
    if (panesEls.length) {
      (panesEls[0] as HTMLElement).focus();
    }
  }
}
