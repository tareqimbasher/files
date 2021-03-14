import { bindable } from "aurelia";
import { File as F } from "../core/files/file";

export class File {

    @bindable
    public file?: F;
}