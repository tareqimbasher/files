import { bindable } from "aurelia";
import { Util } from "../../../core";
import { PaneInfo } from "../pane-info";
import { PathInfo } from "../path-info";

export class Tab {

    public id: string;

    @bindable public pane!: PaneInfo;
    @bindable public pathInfo!: PathInfo;

    constructor() {
        this.id = Util.newGuid();
    }
}