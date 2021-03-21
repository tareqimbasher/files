import { Util } from "../../../core";
import { Tabs } from "./tabs";
import * as pathUtil from "path";
import * as fs from "fs";
import * as os from "os";

export class TabInfo {
    public id: string;
    public isActive: boolean = false;
    public path!: string;
    public pathParts: string[] = [];

    constructor(public tabs: Tabs, path: string) {
        this.id = Util.newGuid();
        this.setPath(path);
    }

    public setPath(path: string) {
        if (!path)
            throw new Error("path is null or undefined.");

        if (path.startsWith("~"))
            path = path.replace("~", os.homedir());
        else if (path.startsWith("/"))
            path = path.replace("/", pathUtil.parse(process.cwd()).root);

        this.path = path;
        this.splitPathToParts();
    }

    public goUp() {
        let newPath = pathUtil.dirname(this.path);
        if (newPath != this.path && fs.existsSync(newPath))
            this.setPath(newPath);
    }

    public splitPathToParts() {
        this.pathParts = this.path.split(/[/\\]+/);
    }

    public activate() {
        this.tabs.setActive(this);
    }
}
