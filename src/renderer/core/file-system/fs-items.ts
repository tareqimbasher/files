import { Dictionary, FileSystemItem } from "../";

export class FsItems extends Dictionary<string, FileSystemItem> {

    public selected: FileSystemItem[] = [];
    public view: FileSystemItem[] = [];

    public remove(key: string): FileSystemItem | undefined {
        const removed = super.remove(key);
        if (!!removed) {
            const ixSelected = this.selected.indexOf(removed)
            if (ixSelected >= 0)
                this.selected.splice(ixSelected, 1);

            const ixView = this.view.indexOf(removed);
            if (ixView >= 0)
                this.view.splice(ixView, 1);
        }

        return removed;
    }

    public clear() {
        super.clear();
        this.selected.splice(0, this.selected.length);
        this.view.splice(0, this.selected.length);
    }


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
}