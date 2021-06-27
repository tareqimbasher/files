import { singleton } from "aurelia";
import { FileSystemItem } from "../../../core";

@singleton()
export class Clipboard {
    public items: ClipboardItem[] = [];
    public type?: ClipboardItemType;

    public addCopyItems(...items: FileSystemItem[]) {
        this.clear();
        this.type = ClipboardItemType.Copy;
        this.items.push(...items.map(i => new ClipboardItem(i, ClipboardItemType.Copy)));
    }

    public addCutItems(...items: FileSystemItem[]) {
        this.clear();
        this.type = ClipboardItemType.Cut;
        this.items.push(...items.map(i => new ClipboardItem(i, ClipboardItemType.Cut)));
    }

    public clear() {
        this.items.splice(0);
    }
}

class ClipboardItem {
    constructor(public item: FileSystemItem, public type: ClipboardItemType) {
    }
}

export enum ClipboardItemType {
    Copy = "Copy",
    Cut = "Cut"
}