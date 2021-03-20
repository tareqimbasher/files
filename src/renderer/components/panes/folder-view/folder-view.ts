import { bindable } from "aurelia";
import { Directory, File, FileService, FileSystemItem, Settings } from "../../../core";
import { shell } from "electron";
import * as chokidar from "chokidar";

export class FolderView {
    public message = 'Files';
    public files: FileSystemItem[] = [];
    @bindable public path: string = "/";

    //private dirWatcher: FSWatcher;

    constructor(private fileService: FileService, public settings: Settings) {
    }

    public attached() {
        this.pathChanged();
    }

    public async pathChanged() {
        //chokidar.watch('');
        this.files = await this.fileService.list(this.path);
    }

    public select(file: FileSystemItem) {
        this.files.forEach(f => f.isSelected = false);
        file.isSelected = true;
    }

    public open(file: FileSystemItem) {
        if (file instanceof Directory) {
            this.path = file.path;
        }
        else {
            shell.openExternal(file.path);
        }
    }
}