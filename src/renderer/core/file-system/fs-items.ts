import { Dictionary, FileSystemItem } from "../";
import { Settings } from "../settings";

export class FsItems extends Dictionary<string, FileSystemItem> {

    private searchTerm?: string;

    constructor(private settings: Settings) {
        super();
    }

    public get selected(): FileSystemItem[] {
        return this.view.filter(i => i.isSelected);
    }

    public get view(): FileSystemItem[] {

        let results: FileSystemItem[] = [];

        if (this.settings.showHiddenFiles && !this.searchTerm) {
            results = this.values;
        }
        else {
            results = this.values
                .filter(i =>
                    (this.settings.showHiddenFiles || !i.isHidden) &&
                    (!this.searchTerm || i.name.toLowerCase().indexOf(this.searchTerm) >= 0)
                );
        }

        return results.sort((a, b) => {
            const n1 = a.name.toLowerCase();
            const n2 = b.name.toLowerCase();

            return ((n1 > n2) ? 1 : -1);
        });
    }

    public select(...items: FileSystemItem[]) {
        for (let item of items) {
            if (item.isSelected)
                continue;

            item.isSelected = true;
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
        }
    }

    public unselectAll(...items: FileSystemItem[]) {
        this.unselect(...this.selected);
    }

    public inverseSelection(...items: FileSystemItem[]) {
        for (let item of items) {
            item.isSelected ? this.unselect(item) : this.select(item);
        }
    }

    public search(term: string) {
        this.searchTerm = term;
    }
}