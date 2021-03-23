import * as _os from "os";
import * as _fs from "fs";
import * as _path from "path";
import { shell as _shell } from "electron";

export namespace system {
    export var os = _os;
    export var fs = _fs.promises;
    export var fss = _fs;
    export var path = _path;
    export var shell = _shell;
}