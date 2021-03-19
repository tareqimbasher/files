import { bindable } from "aurelia";
import { Util } from "../../../core";

export class Tab {
    public id: string;
    @bindable public path?: string;

    constructor() {
        this.id = Util.newGuid();
    }
}