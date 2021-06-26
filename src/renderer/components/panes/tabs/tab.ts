import { IContainer, IDisposable } from "aurelia";
import { FileService, FileSystemItem, FsItems, Settings, system, Util } from "../../../core";
import { Tabs } from "./tabs";
import * as chokidar from "chokidar";
import { Stats } from "fs";

export class Tab implements IDisposable {
    public id: string;
    public isActive: boolean = false;
    public path!: string;
    public pathName!: string;
    public pathParts: string[] = [];

    public fsItems: FsItems;
    public history: TabHistory;

    private fileService: FileService;
    private settings: Settings;
    private disposables: (() => void)[] = [];
    private fsWatcher: chokidar.FSWatcher | undefined;

    constructor(public tabs: Tabs, path: string, private container: IContainer) {
        this.id = Util.newGuid();
        this.fileService = container.get(FileService);
        this.settings = container.get(Settings);
        this.fsItems = new FsItems(this.settings);

        this.history = new TabHistory(path);
        this.setPath(this.history.current);
    }

    public setPath(state: TabHistoryState): void;
    public setPath(path: string): void;

    public setPath(pathOrHistoryState: string | TabHistoryState) {
        if (!pathOrHistoryState)
            throw new Error("path is null or undefined.");

        this.history.current.remember(this.fsItems);

        const oldPath = this.path;
        let newPath: string;

        if (typeof pathOrHistoryState === 'string') {

            let path = pathOrHistoryState as string;

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

            newPath = this.history.set(new TabHistoryState(path)).path;
        }
        else {
            newPath = this.history.set(pathOrHistoryState).path;
        }

        this.path = newPath;
        this.pathChanged(oldPath, this.path);
    }

    private async pathChanged(oldPath: string, newPath: string) {
        this.pathName = system.path.basename(newPath);
        if (!this.pathName.trim()) this.pathName = newPath;
        this.pathParts = newPath.split(/[/\\]+/);

        await this.updateFileListing(newPath);

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

    public dispose(): void {
        this.disposables.forEach(d => d());
    }

    private async updateFileListing(newPath: string) {
        performance.clearMarks();
        performance.mark("tab.getfiles.start");

        let fsItems = await this.fileService.list(newPath);
        this.fsItems.clear();


        performance.mark("tab.fsItems.addOrSetRange.start");
        this.fsItems.addOrSetRange(...fsItems.map(f => {
            return {
                key: f.name,
                value: f
            };
        }));
        performance.mark("tab.fsItems.addOrSetRange.end");


        const itemAdded = async (itemPath: string, stats: Stats | undefined) => {
            const name = system.path.basename(itemPath);

            if (itemPath == newPath)
                return;

            if (this.fsItems.containsKey(name))
                return;

            const item = await this.fileService.createFileSystemItem(
                itemPath,
                stats,
                this.fileService.getUnixMethodItemAttributes(name)
            );

            if (!item) {
                return;
            }

            this.fsItems.addOrSet(item.name, item);
        }

        const itemRemoved = async (itemPath: string) => {
            const name = system.path.basename(itemPath);

            if (!this.fsItems.containsKey(name))
                return;

            this.fsItems.remove(name);
        }



        if (!this.fsWatcher) {
            this.fsWatcher = chokidar.watch(newPath, {
                depth: 0,
                persistent: true
            });
            this.disposables.push(() => this.fsWatcher?.close());
        }
        else {
            await this.fsWatcher.close();
            this.fsWatcher.add(newPath);
        }

        this.fsWatcher
            .on('add', async (path, stats) => {
                //console.log(`File ${path} has been added`, stats);
                itemAdded(path, stats);
            })
            .on('change', (path, stats) => {
                //console.log(`File ${path} has been changed`, stats);
                const item = this.fsItems.get(system.path.basename(path));
                if (stats)
                    item.updateInfo(stats);
            })
            .on('unlink', path => {
                //console.log(`File ${path} has been removed`);
                itemRemoved(path);
            })
            .on('addDir', async (path, stats) => {
                //console.log(`Directory ${path} has been added`, stats);
                itemAdded(path, stats);
            })
            .on('unlinkDir', path => {
                //console.log(`Directory ${path} has been removed`);
                itemRemoved(path);
            })
            .on('error', error => console.log(`Watcher error: ${error}`));

        performance.mark("tab.getfiles.end");


        const showPerfInfo = true;

        if (showPerfInfo) {
            const marks = Array.from(performance.getEntriesByType("mark"));
            for (let item of marks) {
                if (item.name.endsWith('.start')) continue;

                const endMark = item;
                const measurementName = endMark.name.split('.').slice(0, -1).join('.');
                const startMarkName = measurementName + '.start';
                const startMark = marks.find(m => m.name == startMarkName);

                if (!startMark) throw new Error("Could not find start mark for: " + endMark.name);
                performance.measure(measurementName, startMark.name, endMark.name);

                const measurement = performance.getEntriesByName(measurementName).slice(-1)[0];
                console.warn({
                    name: measurement.name,
                    duration: measurement.duration
                });
            }
        }
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