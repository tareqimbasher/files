import { bindable, watch } from "aurelia";
import { Directory, File, FileService, FileSystemItem, Settings } from "../../../core";
import { shell } from "electron";
import * as chokidar from "chokidar";
import { PathInfo } from "../path-info";

export class FolderView {
    public message = 'Files';
    public files: FileSystemItem[] = [];
    @bindable public pathInfo!: PathInfo;

    //private dirWatcher: FSWatcher;

    constructor(private fileService: FileService, public settings: Settings) {
    }

    public attached() {
        this.pathChanged();
    }

    @watch((fv: FolderView) => fv.pathInfo.path)
    public async pathChanged() {
        //chokidar.watch('');
        this.files = await this.fileService.list(this.pathInfo.path);
    }

    public select(file: FileSystemItem) {
        this.files.forEach(f => f.isSelected = false);
        file.isSelected = true;
    }

    public open(file: FileSystemItem) {
        if (file instanceof Directory) {
            this.pathInfo.setPath(file.path);
            this.pathChanged();
        }
        else {
            shell.openExternal(file.path);
        }
    }
}