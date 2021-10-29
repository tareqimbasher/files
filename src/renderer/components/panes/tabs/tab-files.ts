import { IDisposable } from "aurelia";
import { Stats } from "fs";
import * as chokidar from "chokidar";
import { Directory, FileService, FsItems, Settings } from "core";
import { system } from "common";

export class Files extends FsItems implements IDisposable {
  private fsWatcher: chokidar.FSWatcher | undefined;
  private disposables: (() => void)[] = [];

  constructor(settings: Settings, private fileService: FileService) {
    super(settings);
  }

  public async updateFileListing(newPath: string) {
    performance.clearMarks();
    performance.mark("tab.getfiles.start");

    const fsItems = await this.fileService.list(newPath);
    this.clear();

    performance.mark("tab.fsItems.addOrSetRange.start");
    this.addOrSetRange(
      ...fsItems.map((f) => {
        return {
          key: f.name,
          value: f,
        };
      })
    );
    performance.mark("tab.fsItems.addOrSetRange.end");

    if (!this.fsWatcher) {
      this.fsWatcher = chokidar.watch(newPath, {
        depth: 1,
        persistent: true,
        followSymlinks: false,
        ignorePermissionErrors: true,
      });
      this.disposables.push(() => this.fsWatcher?.close());
    } else {
      await this.fsWatcher.close();
      this.fsWatcher.add(newPath);
    }

    this.fsWatcher
      .on("add", async (path, stats) => {
        //console.log(`File ${path} has been added`, stats);
        this.itemAdded(newPath, path, stats);
      })
      .on("change", (path, stats) => {
        //console.log(`File ${path} has been changed`, stats);
        const item = this.get(system.path.basename(path));
        if (stats) item.updateInfo(stats);
      })
      .on("unlink", (path) => {
        //console.log(`File ${path} has been removed`);
        this.itemRemoved(newPath, path);
      })
      .on("addDir", async (path, stats) => {
        //console.log(`Directory ${path} has been added`, stats);
        this.itemAdded(newPath, path, stats);
      })
      .on("unlinkDir", (path) => {
        //console.log(`Directory ${path} has been removed`);
        this.itemRemoved(newPath, path);
      })
      .on("error", (error) => {
        console.error("FS Watcher error", error);
      });

    performance.mark("tab.getfiles.end");

    const showPerfInfo = false;

    if (showPerfInfo) {
      const marks = Array.from(performance.getEntriesByType("mark"));
      for (const item of marks) {
        if (item.name.endsWith(".start")) continue;

        const endMark = item;
        const measurementName = endMark.name.split(".").slice(0, -1).join(".");
        const startMarkName = measurementName + ".start";
        const startMark = marks.find((m) => m.name == startMarkName);

        if (!startMark) throw new Error("Could not find start mark for: " + endMark.name);
        performance.measure(measurementName, startMark.name, endMark.name);

        const measurement = performance.getEntriesByName(measurementName).slice(-1)[0];
        console.warn({
          name: measurement.name,
          duration: measurement.duration,
        });
      }
    }
  }

  public dispose(): void {
    this.disposables.forEach((d) => d());
  }

  private async itemAdded(newPath: string, itemPath: string, stats: Stats | undefined) {
    if (itemPath == newPath) return;

    const name = system.path.basename(itemPath);
    const dirPath = system.path.dirname(itemPath);

    // if an item was added at depth 1
    if (dirPath != newPath) {
      const dir = this.values.find((i) => i.path == dirPath) as Directory;
      if (dir) await dir.containingItemsChanged();
      return;
    }

    if (this.containsKey(name)) return;

    const item = await this.fileService.createFileSystemItem(
      itemPath,
      stats,
      this.fileService.getUnixMethodItemAttributes(name)
    );

    if (!item) {
      console.warn("no item");
      return;
    }

    this.addOrSet(item.name, item);
  }

  private async itemRemoved(newPath: string, itemPath: string) {
    const name = system.path.basename(itemPath);
    const dirPath = system.path.dirname(itemPath);

    if (dirPath == system.path.parse(process.cwd()).root) return;

    // if an item was removed at depth 1
    if (dirPath != newPath) {
      const dir = this.values.find((i) => i.path == dirPath) as Directory;
      if (dir) await dir.containingItemsChanged();
      return;
    }

    if (!this.containsKey(name)) return;

    this.remove(name);
  }
}
