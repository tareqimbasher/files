import { watch } from "aurelia";
import { FileSystemItem, Settings } from "../../core";
import { WindowManager } from "../";

export class StatusBar {

    public files?: FileSystemItem[];
    public selectedFiles?: FileSystemItem[];

    constructor(public settings: Settings, public windowManager: WindowManager) {
    }

    public attached() {
    }

    //@watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active.folderView?.files.length)
    //@watch((sb: StatusBar) => sb.windowManager.panes.active.tabs.active?.folderView?.selectedFiles.length)
    //private getFiles() {
    //    this.files = this.windowManager.currentPane?.currentPath?.folderView?.files;
    //    this.selectedFiles = this.windowManager.currentPane?.currentPath?.folderView?.selectedFiles;
    //}
}