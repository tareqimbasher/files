import { ipcMain, IpcMainEvent } from "electron";
import { WindowManager } from "../window-manager";

export class IpcEventBus {
  constructor(private readonly windowManager: WindowManager) {}

  public publish<T extends Constructable>(message: T extends Constructable ? InstanceType<T> : T) {
    if (message.constructor) {
      this.windowManager.windows.forEach((window) =>
        window.webContents.send(message.constructor.name, message)
      );
    }
  }

  public subscribe<T extends Constructable>(type: T, callback: (message: InstanceType<T>) => void) {
    if (type.name) {
      const handler = (event: IpcMainEvent, args: any[]) => callback(args[0]);
      ipcMain.on(type.name, handler);
      return new Token(() => ipcMain.off(type.name, handler));
    } else {
      throw new Error("Type has no name");
    }
  }
}

export class Token {
  constructor(private func: () => void) {}

  public dispose() {
    this.func();
  }
}

type Constructable<T = any> = {
  new (...args: any[]): T;
};
