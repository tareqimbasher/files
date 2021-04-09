import { singleton } from "aurelia";
import { Panes } from "./panes/panes";

@singleton()
export class WindowManager {
    constructor(public panes: Panes) {
    }
}