import * as pathUtil from 'path';
import { FileType } from "./file-system-item-type";

export abstract class FileSystemItem {

    public path: string;
    public name: string;
	public type?: FileType;

    constructor(path: string) {
        this.path = path;
        this.name = pathUtil.basename(path);
    }
}