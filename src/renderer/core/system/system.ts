import * as _os from 'os';
import * as _fs from 'fs';
//import * as _fsx from "fs-extra";
import * as _path from 'path';
import { shell as _shell, remote as _remote } from 'electron';

export class system {
    public static fileScheme = 'atom';
    public static platform = _os.platform();
    public static os = _os;
    public static fs = _fs.promises;
    public static fss = _fs;
    public static path = _path;
    public static shell = _shell;
    public static remote = _remote;

    //export var fsx = _fsx;
}