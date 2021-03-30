import * as pathUtil from 'path';
import { FileType } from "./file-system-item-type";

export abstract class FileSystemItem {

    public path: string;
    public name: string;
    public extension: string;
    public type?: FileType;
    public isSelected: boolean = false;
    public isHidden: boolean = false;
    public isSystem: boolean = false;

    constructor(path: string) {
        this.path = path;
        this.name = pathUtil.basename(path);
        this.extension = pathUtil.extname(path);
        if (!!this.extension)
            this.extension = this.extension.toLowerCase();
    }
}