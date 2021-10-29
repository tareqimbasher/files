import { bindable } from "aurelia";
import { Settings } from "application";
import { Pane } from "../pane";

export class PaneView {
  @bindable public pane!: Pane;

  constructor(public readonly settings: Settings) {}

  public attached() {
    this.pane.tabs.refreshTabBinding();
  }
}
