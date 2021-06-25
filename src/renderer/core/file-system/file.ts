import { FileSystemItem } from "./file-system-item";
import { FileType } from "./file-system-item-type";

export class File extends FileSystemItem {
    constructor(path: string) {
        super(path, FileType.File);
    }
}
