import { exec as _exec } from "child_process";
import * as _os from "os";
import * as _path from "path";
import { shell as _shell } from "electron";
import * as _fsx from "fs-extra";
import { ElectronUtil } from "../utils/electron-util";

export class system {
  public static exec = _exec;
  public static fileScheme = "atom";
  public static fs = _fsx;
  public static os = _os;
  public static path = _path;
  public static platform = _os.platform();
  public static shell = _shell;

  public static get remote() {
    if (ElectronUtil.executingFromRenderer()) {
      return require("@electron/remote");
    }
    throw new Error("Cannot execute this function except from the renderer process.");
  }
}
