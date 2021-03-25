import { bindable, watch } from "aurelia";
import { Directory, File, FileService, FileSystemItem, FileType, KeyCode, Settings, UiUtil } from "../../../core";
import { shell } from "electron";
import * as chokidar from "chokidar";
import { TabInfo } from "../tabs/tab-info";

export class FolderView {
    public message = 'Files';
    public files: FileSystemItem[] = [];
    public selectedFiles: FileSystemItem[] = [];
    @bindable public tab!: TabInfo;

    private detaches: (() => void)[] = [];

    //private dirWatcher: FSWatcher;

    constructor(private fileService: FileService, public settings: Settings, private element: HTMLElement) {
    }

    public attached() {
        this.pathChanged();

        let keyHandler = (ev: KeyboardEvent) => this.handleKeyPress(ev);
        (this.element).addEventListener("keydown", keyHandler);
        this.detaches.push(() => this.element.removeEventListener("keydown", keyHandler));
    }

    public detached() {
        this.detaches.forEach(f => f());
    }

    @watch((fv: FolderView) => fv.tab.path)
    public async pathChanged() {
        //chokidar.watch('');
        let files = await this.fileService.list(this.tab.path);

        files = files.filter(f => !f.name.startsWith('.'));

        this.files = files;
    }

    public select(...files: FileSystemItem[]) {
        this.files.forEach(f => f.isSelected = false);
        files.forEach(f => f.isSelected = true);
        this.selectedFiles = files;
    }

    public open(...files: FileSystemItem[]) {
        // TODO handle multiple directories selected or mix of dir and files
        // Currently if a directory is selected we will only handle that dir
        var dir = files.find(f => f instanceof Directory);
        if (dir)
            files = [dir];
        
        for (let file of files) {
            try {
                if (file instanceof Directory) {
                    this.tab.setPath(file.path);
                    this.pathChanged();
                }
                else {
                    shell.openExternal(file.path);
                }
            }
            catch (ex) {
                console.error(ex);
            }
        }
    }

    public emptySpaceClicked(ev: MouseEvent) {
        this.element.focus();

        if ((ev.target as Element).tagName.toLowerCase() == "fs-item")
            return;

        this.files.forEach(f => f.isSelected = false);
        this.selectedFiles = [];
    }

    private navigateGrid(direction: "up" | "down" | "right" | "left") {
        let grid = this.element.querySelector("folder-view > .list")!;
        UiUtil.navigateGrid(grid, "selected", direction, ix => this.select(this.files[ix]));
    }

    private handleKeyPress(ev: KeyboardEvent) {
        if (ev.ctrlKey) {
            if (ev.code == KeyCode.KeyA) {
                this.select(...this.files);
            }
        }
        else {
            if (ev.code == KeyCode.ArrowRight) {
                this.navigateGrid("right");
            }
            else if (ev.code == KeyCode.ArrowLeft) {
                this.navigateGrid("left");
            }
            else if (ev.code == KeyCode.ArrowUp) {
                this.navigateGrid("up");
            }
            else if (ev.code == KeyCode.ArrowDown) {
                this.navigateGrid("down");
            }
            else if (ev.code == KeyCode.Enter && this.selectedFiles.length > 0) {
                this.open(...this.selectedFiles);
            }
        }
    }
}