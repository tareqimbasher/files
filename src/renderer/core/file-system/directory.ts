import { system } from "../system/system";
import { FileSystemItem } from "./file-system-item";
import { FileType } from "./file-system-item-type";

export class Directory extends FileSystemItem {

    public itemCount = 0;

    constructor(path: string) {
        super(path, FileType.Directory);

        system.fs.readdir(this.path).then(files => {
            this.itemCount = files.length;
        }).catch(err => {
            //console.error(`Could not get file count of dir: ${path}`);
        });
    }
}