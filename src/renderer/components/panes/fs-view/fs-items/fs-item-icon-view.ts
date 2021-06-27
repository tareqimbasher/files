import { bindable } from "aurelia";
import { Directory, FileSystemItem } from "../../../../core";
import { FileSizeValueConverter } from "../../../common";
import { FsItemView } from "./fs-item-view";

export class FSItemIconView extends FsItemView {
    @bindable() item!: FileSystemItem;
    public title = "";

    attached() {
        super.attached();

        let title = "";

        if (this.item instanceof Directory) {
            title = `Contents: ${this.item.itemCount} items`;
        }
        else {
            title = `Size: ${FileSizeValueConverter.toFormattedString(this.item.size)}`;
        }

        title += `\nCreated: ${this.item.dateCreated.toLocaleString()}`;
        title += `\nModified: ${this.item.dateModified.toLocaleString()}`;
        this.title = title;
    }
}