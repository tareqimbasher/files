import { bindable } from "aurelia";
import { FileSystemItem, IconLoader, system } from "../../../../core";

export abstract class FsItemView {
    @bindable
    public item!: FileSystemItem;
    public icon = IconLoader.defaultIcon;

    public attached() {
        IconLoader.getIcon(this.item)
            .then(icon => this.icon = icon);
    }
}