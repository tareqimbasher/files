import { Util } from "../../core";
import { PathInfo } from "./path-info";


export class PaneInfo {
    public id: string;
    public paths: PathInfo[] = [];
    public currentPath?: PathInfo;

    constructor() {
        this.id = Util.newGuid();
    }

    public addTab(path?: string): PathInfo {
        let pathInfo = new PathInfo(path || "C:/");
        this.paths.push(pathInfo);
        return pathInfo;
    }
}
