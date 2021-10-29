import { system } from "../system/system";
import { Directory } from "./directory";
import { File } from "./file";
import { FileSystemItem } from "./file-system-item";
import { SymbolicLink } from "./symbolic-link";
import { exec } from "child_process";
import { Dictionary } from "../data/dictionary";
import { ILogger } from "aurelia";
import { Stats } from "fs";

export class FileService {
  constructor(@ILogger private readonly logger: ILogger) {}

  /**
   * Lists file system items from a directory path.
   * @param dirPath Path of the directory to list.
   */
  public async list(dirPath: string): Promise<FileSystemItem[]> {
    performance.mark("fileservice.list.fs.readdir.start");
    const itemNames = await system.fs.readdir(dirPath);
    performance.mark("fileservice.list.fs.readdir.end");

    performance.mark("fileservice.list.getDirItemAttributes.start");
    const itemAttributes = await this.getDirItemAttributes(dirPath, itemNames);
    performance.mark("fileservice.list.getDirItemAttributes.end");

    performance.mark("fileservice.list.createItems.start");
    const items: FileSystemItem[] = [];
    for (const name of itemNames) {
      let attributes;

      if (itemAttributes.containsKey(name)) {
        attributes = itemAttributes.get(name);
      }

      const item = await this.createFileSystemItem(
        system.path.join(dirPath, name),
        undefined,
        attributes
      );

      if (!item) continue;

      items.push(item);
    }
    performance.mark("fileservice.list.createItems.end");

    return items;
  }

  /**
   * Creates a FileSystemItem from an file or directory path.
   * @param itemPath Path of file or directory.
   * @param stats Item stats.
   * @param attributes Item attributes.
   */
  public async createFileSystemItem(
    itemPath: string,
    stats?: Stats,
    attributes?: { hidden: boolean; system: boolean } | undefined | null
  ): Promise<FileSystemItem | null> {
    try {
      let item: FileSystemItem;

      if (!stats) {
        stats = await system.fs.stat(itemPath);
      }

      if (stats.isFile()) {
        item = new File(itemPath);
      } else if (stats.isDirectory()) {
        item = new Directory(itemPath);
      } else if (stats.isSymbolicLink()) {
        item = new SymbolicLink(itemPath);
      } else return null;

      item.updateInfo(stats);

      if (attributes) {
        item.isHidden = attributes.hidden ?? false;
        item.isSystem = attributes.system ?? false;
      }

      return item;
    } catch (ex) {
      this.logger.error(`Could not read file: ${itemPath}`, ex);
      return null;
    }
  }

  /**
   * Copies a file system item.
   * @param source The source item to copy.
   * @param targetPath The target path to copy item to.
   * @param overwrite Whether to overwrite the target file or directory if it already exists.
   */
  public async copy(source: FileSystemItem, targetPath: string, overwrite: boolean): Promise<void> {
    const targetPathExists = await system.fs.pathExists(targetPath);

    if (!overwrite && targetPathExists) {
      throw new Error(`Target path already exists: ${targetPathExists}`);
    }

    // TODO for a safer copy (also for move), copy to a temp file, then rename it
    await system.fs.copyFile(
      source.path,
      targetPath,
      !overwrite ? system.fs.constants.COPYFILE_EXCL : undefined
    );
  }

  /**
   * Moves a file system item to a target path.
   * @param item The file system item to move.
   * @param targetPath The target path to move the item to.
   * @param overwrite Whether to overwrite the destination file or folder if it already exists.
   */
  public move(item: FileSystemItem, targetPath: string, overwrite?: boolean): Promise<void>;

  /**
   * Moves a file system item to a target directory.
   * @param item The file system item to move.
   * @param targetDirectory The directory to move the item into.
   * @param overwrite Whether to overwrite the destination file or folder if it already exists.
   */
  public move(item: FileSystemItem, targetDirectory: Directory, overwrite?: boolean): Promise<void>;

  /**
   * Moves a file system item to a target path or directory.
   * @param item The file system item to move.
   * @param target The target path or directory to move the item to.
   * @param overwrite Whether to overwrite the destination file or folder if it already exists.
   */
  public async move(
    item: FileSystemItem,
    target: string | Directory,
    overwrite = false
  ): Promise<void> {
    if (overwrite !== true) overwrite = false;

    if (!target) throw new Error("Target is invalid.");

    let targetPath: string;

    if (typeof target === "string") {
      targetPath = target;
    } else {
      targetPath = system.path.join(target.path, item.name);
    }

    if (!overwrite && (await system.fs.pathExists(targetPath))) {
      throw new Error(`Target path already exists: ${targetPath}`);
    }

    await system.fs.rename(item.path, targetPath);
  }

  /**
   * Renames a file system item.
   * @param item The file system item to rename.
   * @param newName The name name. This should only be the base file or directory name, not a path.
   */
  public async rename(item: FileSystemItem, newName: string): Promise<void> {
    const newPath = system.path.join(item.directoryPath, newName);
    if (await system.fs.pathExists(newPath)) throw new Error("Path already exists.");
    await system.fs.rename(item.path, newPath);
  }

  /**
   * Moves a file system item to the trash.
   * @param item
   */
  public async moveToTrash(item: FileSystemItem) {
    return await system.shell.trashItem(item.path);
  }

  /**
   * Permanently Deletes a file system item.
   * @param item
   */
  public async delete(item: FileSystemItem) {
    if (item.isDir) await system.fs.remove(item.path);
    else await system.fs.unlink(item.path);
  }

  /**
   * Gets the attributes of a directory's containing items.
   * @param dirPath The path of the directory.
   * @param itemNames The names of the items inside the directory.
   */
  public async getDirItemAttributes(
    dirPath: string,
    itemNames: string[]
  ): Promise<Dictionary<string, { hidden: boolean; system: boolean }>> {
    return this.getUnixDirItemAttributes(itemNames);

    //return system.platform == "win32" ?
    //    await this.getWinDirItemAttributes(dirPath) :
    //    this.getUnixDirItemAttributes(itemNames);
  }

  public async getWinDirItemAttributes(
    dirPath: string
  ): Promise<Dictionary<string, { hidden: boolean; system: boolean }>> {
    return new Promise<Dictionary<string, { hidden: boolean; system: boolean }>>(
      (resolve, reject) => {
        const data = new Dictionary<string, { hidden: boolean; system: boolean }>();

        exec(
          `ls "${dirPath}" -Hidden | select Name, Attributes | format-list`,
          { shell: "powershell.exe" },
          (error, stdout, stderr) => {
            if (error) {
              reject(stderr);
              return;
            }

            if (!stdout) {
              resolve(data);
              return;
            }

            const itemInfos = stdout.trim().split(system.os.EOL + system.os.EOL);

            for (let i = 0; i < itemInfos.length; i++) {
              const itemInfoLines = itemInfos[i].split(system.os.EOL);
              const itemName = itemInfoLines[0].split(":")[1].trim();
              const attributes = itemInfoLines[1].split(":")[1].trim().split(", ");

              data.addOrSet(itemName, {
                hidden: !!attributes.find((x) => x.indexOf("Hidden") >= 0),
                system: !!attributes.find((x) => x.indexOf("System") >= 0),
              });
            }

            resolve(data);
          }
        );
      }
    );
  }

  public getUnixDirItemAttributes(
    itemNames: string[]
  ): Dictionary<string, { hidden: boolean; system: boolean }> {
    const data = new Dictionary<string, { hidden: boolean; system: boolean }>();

    for (let i = 0; i < itemNames.length; i++) {
      const itemName = itemNames[i];
      data.addOrSet(itemName, this.getUnixMethodItemAttributes(itemName));
    }

    return data;
  }

  public getUnixMethodItemAttributes(itemName: string): { hidden: boolean; system: boolean } {
    return {
      hidden: itemName.startsWith("."),
      system: false,
    };
  }
}
