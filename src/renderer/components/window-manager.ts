import { singleton } from "aurelia";
import { Panes } from "./panes/panes";

@singleton()
export class WindowManager {
    public panes: Panes;

    constructor() {
        this.panes = new Panes();
    }
}