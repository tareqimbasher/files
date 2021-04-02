import { FsItems, Util } from "../../../core";
import { Tabs } from "./tabs";
import * as pathUtil from "path";
import * as fs from "fs";
import * as os from "os";

export class TabInfo {
    public id: string;
    public isActive: boolean = false;
    public path!: string;
    public pathName!: string;
    public pathParts: string[] = [];

    public history: string[] = [];
    public atHistoryIndex = 0;

    public fsItems: FsItems;

    constructor(public tabs: Tabs, path: string) {
        this.id = Util.newGuid();
        this.fsItems = new FsItems();
        this.setPath(path);
    }

    public setPath(path: string, addToHistory: boolean = true) {
        if (!path)
            throw new Error("path is null or undefined.");

        // Handle special path locations
        if (path.startsWith("~"))
            path = path.replace("~", os.homedir());
        else if (path.startsWith("/"))
            path = path.replace("/", pathUtil.parse(process.cwd()).root);

        // Normalize Windows path endings for drive roots
        if (path.endsWith(":."))
            path = path.slice(0, -1) + '/';
        else if (path.endsWith(":"))
            path = path + "/";

        path = path.replaceAll("/", "\\");

        if (this.path == path)
            return;

        this.path = path;
        this.pathChanged(addToHistory);
    }

    private pathChanged(addToHistory: boolean) {
        this.pathName = pathUtil.basename(this.path);
        if (!this.pathName.trim()) this.pathName = this.path;

        this.pathParts = this.path.split(/[/\\]+/);

        if (addToHistory) {
            if (this.history.length - 1 > this.atHistoryIndex) {
                this.history.splice(this.atHistoryIndex + 1, this.history.length - this.atHistoryIndex);
            }
            this.history.push(this.path);
            this.atHistoryIndex = this.history.length - 1;
        }
    }

    public goBack() {
        if (this.atHistoryIndex == 0) return;
        this.setPath(this.history[--this.atHistoryIndex], false);
    }

    public goForward() {
        if (this.atHistoryIndex == this.history.length - 1) return;
        this.setPath(this.history[++this.atHistoryIndex], false);
    }

    public goUp() {
        let newPath = pathUtil.dirname(this.path);
        if (newPath != this.path && fs.existsSync(newPath))
            this.setPath(newPath);
    }

    public activate() {
        this.tabs.setActive(this);
    }

    public close() {
        this.tabs.remove(this);
    }
}
