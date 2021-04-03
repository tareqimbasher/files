import { bindable } from "aurelia";
import { FileSystemItem } from "../../../../core";

export class FSItem {
    @bindable
    public item?: FileSystemItem;

    public thumbnail() {
        return 'atom://' + this.item?.path;
    }
}