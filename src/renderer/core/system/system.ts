import * as _os from "os";
import * as _path from "path";
import { shell as _shell } from "electron";
import * as _remote from "@electron/remote";
import * as _fsx from "fs-extra";

export class system {
  public static fileScheme = "atom";
  public static platform = _os.platform();
  public static os = _os;
  public static path = _path;
  public static shell = _shell;
  public static remote = _remote;
  public static fs = _fsx;
}
