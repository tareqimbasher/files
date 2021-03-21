import { Util } from "../../core";
import * as path from "path";
import * as fs from "fs";

export class PathInfo {
    public id: string;
    public path!: string;
    public pathParts: string[] = [];

    constructor(path: string) {
        this.id = Util.newGuid();
        this.setPath(path);
    }

    public setPath(path: string) {
        if (!path)
            throw new Error("path is null or undefined.");

        this.path = path;
        this.splitPathToParts();
    }

    public goUp() {
        let newPath = path.dirname(this.path);
        if (newPath != this.path && fs.existsSync(newPath))
            this.path = newPath;
    }

    public splitPathToParts() {
        this.pathParts = this.path.split(/[/\\]+/);
    }
}
