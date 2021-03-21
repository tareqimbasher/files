import { watch } from "aurelia";
import { FileSystemItem, Settings } from "../../core";
import { PaneManager } from "../panes/pane-manager";

export class StatusBar {

    public files?: FileSystemItem[];
    public selectedFiles?: FileSystemItem[];

    constructor(public settings: Settings, private paneManager: PaneManager) {
    }

    public attached() {
    }

    @watch((sb: StatusBar) => sb.paneManager.currentPane?.currentPath?.folderView?.files.length)
    @watch((sb: StatusBar) => sb.paneManager.currentPane?.currentPath?.folderView?.selectedFiles.length)
    private getFiles() {
        this.files = this.paneManager.currentPane?.currentPath?.folderView?.files;
        this.selectedFiles = this.paneManager.currentPane?.currentPath?.folderView?.selectedFiles;
    }
}