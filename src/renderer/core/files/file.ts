import { promises as fs } from 'fs';
import * as paths from 'path';

export class File {

    public path: string;
    public name: string;
    public type?: FileType;

    constructor(path: string) {
        this.path = path;
        this.name = paths.basename(path);

        fs.stat(path).then(stats => {
            if (stats.isFile())
                this.type = FileType.File;
            else if (stats.isDirectory())
                this.type = FileType.Directory;
            else if (stats.isSymbolicLink())
                this.type = FileType.SymbolicLink;
            else
                console.error(`Unknown file type: ${path}`);
        });
    }
}

export enum FileType {
    File = "File",
    Directory = "Directory",
    SymbolicLink = "SymbolicLink"
}