import { FileSystemItem } from "./file-system-item";
import { FileType } from "./file-system-item-type";

export class Directory extends FileSystemItem {
    constructor(path: string) {
        super(path);
        this.type = FileType.Directory;
    }
}