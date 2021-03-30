import { Dictionary, FileSystemItem } from "../../../core";

export class FsItems extends Dictionary<string, FileSystemItem> {
    public selected: FileSystemItem[] = [];

    public select(...items: FileSystemItem[]) {
        for (let item of items) {
            if (item.isSelected)
                continue;

            item.isSelected = true;
            this.selected.push(item);
        }
    }

    public selectAll() {
        this.select(...this.values);
    }

    public unselect(...items: FileSystemItem[]) {
        for (let item of items) {
            if (!item.isSelected)
                continue;

            item.isSelected = false;
            this.selected.splice(this.selected.indexOf(item), 1);
        }
    }

    public unselectAll(...items: FileSystemItem[]) {
        this.unselect(...this.values);
    }

    public inverseSelection(...items: FileSystemItem[]) {
        for (let item of items) {
            item.isSelected ? this.unselect(item) : this.select(item);
        }
    }

    public clear() {
        super.clear();
        this.selected.splice(0, this.selected.length);
    }
}