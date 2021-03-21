import { bindable, watch } from "aurelia";
import { Directory, File, FileService, FileSystemItem, Settings } from "../../../core";
import { shell } from "electron";
import * as chokidar from "chokidar";
import { TabInfo } from "../tabs/tab-info";

export class FolderView {
    public message = 'Files';
    public files: FileSystemItem[] = [];
    public selectedFiles: FileSystemItem[] = [];
    @bindable public tab!: TabInfo;

    //private dirWatcher: FSWatcher;

    constructor(private fileService: FileService, public settings: Settings) {
    }

    public attached() {
        this.pathChanged();
    }

    @watch((fv: FolderView) => fv.tab.path)
    public async pathChanged() {
        //chokidar.watch('');
        let files = await this.fileService.list(this.tab.path);

        files = files.filter(f => !f.name.startsWith('.'));

        this.files = files;
    }

    public select(file: FileSystemItem) {
        this.files.forEach(f => f.isSelected = false);
        file.isSelected = true;
        this.selectedFiles = [file];
    }

    public open(file: FileSystemItem) {
        if (file instanceof Directory) {
            this.tab.setPath(file.path);
            this.pathChanged();
        }
        else {
            shell.openExternal(file.path);
        }
    }

    public clicked(ev: MouseEvent) {
        this.files.forEach(f => f.isSelected = false);
        this.selectedFiles = [];
    }
}