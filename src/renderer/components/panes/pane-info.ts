import { Util } from "../../core";
import { PathInfo } from "./path-info";
import * as os from "os";

export class PaneInfo {
    public id: string;
    public paths: PathInfo[] = [];
    public currentPath?: PathInfo;

    constructor() {
        this.id = Util.newGuid();
    }

    public addTab(path?: string): PathInfo {
        let pathInfo = new PathInfo(path || os.homedir());
        this.paths.push(pathInfo);
        return pathInfo;
    }
}
