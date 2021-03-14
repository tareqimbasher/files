import { bindable } from "aurelia";
import { File as F } from "../core/file-system/file";

export class File {

    @bindable
    public file?: F;
}