import { FileSystemItem } from "./file-system-item";
import { FileType } from "./file-system-item-type";

export class SymbolicLink extends FileSystemItem {
    constructor(path: string) {
        super(path);
        this.type = FileType.SymbolicLink;
    }
}