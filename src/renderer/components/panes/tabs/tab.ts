import { IContainer, IDisposable } from "aurelia";
import { Directory, FileService, Settings, system, Util } from "../../../core";
import { Tabs } from "./tabs";
import { TabHistory } from "./tab-history";
import { TabHistoryState } from "./tab-history-state";
import { Files } from "./tab-files";

export class Tab implements IDisposable {
    public id: string;
    public isActive: boolean = false;
    public path!: string;
    public pathName!: string;
    public pathParts: string[] = [];
    public directory!: Directory;

    public history: TabHistory;
    public fsItems: Files;

    private settings: Settings;
    private disposables: (() => void)[] = [];

    constructor(public tabs: Tabs, path: string, private container: IContainer) {
        this.id = Util.newGuid();
        this.settings = container.get(Settings);
        this.fsItems = new Files(this.settings, container.get(FileService));

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
        this.pathChanged(oldPath, newPath);
    }

    private async pathChanged(oldPath: string, newPath: string) {
        this.pathName = system.path.basename(newPath);
        if (!this.pathName.trim()) this.pathName = newPath;
        this.pathParts = newPath.split(/[/\\]+/);

        this.directory = new Directory(newPath);
        this.directory.updateInfo(await system.fs.stat(newPath));

        await this.fsItems.updateFileListing(newPath);

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

    public refresh() {
        this.fsItems.updateFileListing(this.path);
    }

    public close() {
        this.tabs.remove(this);
    }

    public dispose(): void {
        this.disposables.forEach(d => d());
    }
}
