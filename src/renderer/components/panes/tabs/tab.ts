import { FileService, FileSystemItem, FsItems, system, Util } from "../../../core";
import { Tabs } from "./tabs";

export class Tab {
    public id: string;
    public isActive: boolean = false;
    public path!: string;
    public pathName!: string;
    public pathParts: string[] = [];

    public fsItems: FsItems;
    public history: TabHistory;

    private fileService: FileService;

    constructor(public tabs: Tabs, path: string, fileService: FileService) {
        this.id = Util.newGuid();
        this.fileService = fileService;
        this.fsItems = new FsItems();

        this.history = new TabHistory(path);
        this.setPath(this.history.current);
    }

    public setPath(state: TabHistoryState) : void;
    public setPath(path: string): void;

    public setPath(path: string | TabHistoryState) {
        if (!path)
            throw new Error("path is null or undefined.");

        this.history.current.remember(this.fsItems);

        if (typeof path === 'string') {
            // Handle special path locations
            if (path.startsWith("~"))
                path = path.replace("~", system.os.homedir());
            else if (path.startsWith("/"))
                path = path.replace("/", system.path.parse(process.cwd()).root);

            // Normalize Windows path endings for drive roots
            if (path.endsWith(":."))
                path = path.slice(0, -1) + '/';
            else if (path.endsWith(":"))
                path = path + "/";

            path = path.replaceAll("/", "\\");

            if (this.path == path)
                return;

            this.path = this.history.set(new TabHistoryState(path)).path;
        }
        else {
            this.path = this.history.set(path).path;
        }
        
        this.pathChanged();
    }

    private async pathChanged() {
        this.pathName = system.path.basename(this.path);
        if (!this.pathName.trim()) this.pathName = this.path;

        this.pathParts = this.path.split(/[/\\]+/);




        performance.mark("pathChangedStart");
        //chokidar.watch('');
        let fsItems = await this.fileService.list(this.path);
        this.fsItems.clear();
        this.fsItems.addOrSetRange(...fsItems.filter(f => !f.isHidden).map(f => {
            return {
                key: f.name,
                value: f
            };
        }));

        // Sort
        this.fsItems.view = this.fsItems.values
            //.sort((a, b) => (a.name < b.name) ? 0 : ((b.name < a.name) ? -1 : 1))
            ;

        performance.mark("pathChangedEnd");
        performance.measure('pathChanged', 'pathChangedStart', 'pathChangedEnd');
        console.warn(performance.getEntriesByName('pathChanged').slice(-1)[0]);




        this.history.current.restore(this.fsItems);
    }

    public goBack() {
        const state = this.history.getPrevious();
        if (state) this.setPath(state);
    }

    public goForward() {
        const state = this.history.getNext();
        if (state) this.setPath(state);
    }

    public goUp() {
        let newPath = system.path.dirname(this.path);
        if (newPath != this.path && system.fss.existsSync(newPath))
            this.setPath(newPath);
    }

    public goHome() {
        this.setPath(system.os.homedir());
    }

    public activate() {
        this.tabs.setActive(this);
    }

    public close() {
        this.tabs.remove(this);
    }
}

/**
 * Keeps track of the navigation history for a Tab.
 */
class TabHistory {

    public list: TabHistoryState[];
    public current!: TabHistoryState;
    public currentIndex = 0;
    public canGoBack = false;
    public canGoForward = false;

    constructor(current: string) {
        this.list = [];
        this.set(new TabHistoryState(current));
    }

    public set(state: TabHistoryState): TabHistoryState {

        this.current = state;

        const ix = this.list.indexOf(state);
        const isNew = ix < 0;

        if (isNew) {
            // If we had previouly gone "back" and we now have a new destination (not going forward in history)
            // then remove the rest of the forward history
            if (this.currentIndex != this.list.length - 1)
                this.list.splice(this.currentIndex + 1, this.list.length - this.currentIndex);

            this.list.push(state);
            this.currentIndex = this.list.length - 1;
        }
        else
            this.currentIndex = ix;

        this.canGoBack = this.currentIndex > 0;
        this.canGoForward = this.currentIndex < (this.list.length - 1);

        return state;
    }

    public getPrevious(): TabHistoryState | undefined {
        return this.currentIndex >= 1
            ? this.list[this.currentIndex - 1]
            : undefined;
    }

    public getNext(): TabHistoryState | undefined {
        return this.currentIndex < (this.list.length - 1)
            ? this.list[this.currentIndex + 1]
            : undefined;
    }
}

class TabHistoryState {

    /**
     * The single selected file system item before this state was navigated away from.
     */
    public selectedFileSystemItem: FileSystemItem | undefined;

    constructor(public path: string) {
    }

    /**
     * Remembers some information that can be restored when this history state is navigated to.
     */
    public remember(fsItems: FsItems) {
        // Remember the single seleceted fs item if applicable
        if (fsItems.selected.length == 1)
            this.selectedFileSystemItem = fsItems.selected[0];
        else
            this.selectedFileSystemItem = undefined;
    }

    /**
     * Restore remembered information.
     */
    public restore(fsItems: FsItems) {
        // Restore the single selected item if applicable
        if (this.selectedFileSystemItem) {
            const item = fsItems.view.find(i => i.name == this.selectedFileSystemItem?.name);
            if (item)
                fsItems.select(item);
        }
    }
}