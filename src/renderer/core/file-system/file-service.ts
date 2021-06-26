import * as pathUtil from 'path';
import { system } from '../system/system';
import { Directory } from './directory';
import { File } from './file';
import { FileSystemItem } from './file-system-item';
import { SymbolicLink } from './symbolic-link';
import { exec } from "child_process";
import { Dictionary } from '../data/dictionary';
import { ILogger } from 'aurelia';
import { Stats } from 'fs';

export class FileService {

    constructor(@ILogger private readonly logger: ILogger) {
    }

    public async list(dirPath: string): Promise<FileSystemItem[]> {
        performance.mark("fileservice.list.fs.readdir.start");
        let itemNames = await system.fs.readdir(dirPath);
        performance.mark("fileservice.list.fs.readdir.end");

        performance.mark("fileservice.list.getDirItemAttributes.start");
        let itemAttributes = await this.getDirItemAttributes(dirPath, itemNames);
        performance.mark("fileservice.list.getDirItemAttributes.end");


        performance.mark("fileservice.list.createItems.start");
        let items: FileSystemItem[] = [];
        for (let name of itemNames) {

            let attributes;

            if (itemAttributes.containsKey(name)) {
                attributes = itemAttributes.get(name);
            }

            let item = await this.createFileSystemItem(
                pathUtil.join(dirPath, name),
                undefined,
                attributes
            );

            if (!item)
                continue;

            items.push(item);
        }
        performance.mark("fileservice.list.createItems.end");

        return items;
    }

    public async createFileSystemItem(itemPath: string, stats?: Stats, attributes?: { hidden: boolean, system: boolean } | undefined | null): Promise<FileSystemItem | null> {
        try {
            let item: FileSystemItem;

            if (!stats) {
                stats = await system.fs.stat(itemPath);
            }

            if (stats.isFile()) {
                item = new File(itemPath);
            }
            else if (stats.isDirectory()) {
                item = new Directory(itemPath);
            }
            else if (stats.isSymbolicLink()) {
                item = new SymbolicLink(itemPath);
            }
            else
                return null;

            item.updateInfo(stats);

            if (attributes) {
                item.isHidden = attributes.hidden;
                item.isSystem = attributes.system;
            }

            return item;

        } catch (ex) {
            this.logger.error(`Could not read file: ${itemPath}`, ex);
            return null;
        }
    }

    public move(source: FileSystemItem, targetPath: string): Promise<void>;
    public move(source: FileSystemItem, targetDirectory: Directory): Promise<void>;

    public async move(source: FileSystemItem, target: string | Directory): Promise<void> {
        if (typeof target === 'string') {
            await system.fs.rename(source.path, target);
        }
        else {
            await system.fs.rename(source.path, system.path.join(target.path, source.name));
        }
    }

    public async rename(source: FileSystemItem, newName: string): Promise<void> {
        await this.move(source, system.path.join(source.directoryPath, newName));
    }

    public async moveToTrash(path: string) {
        return system.shell.moveItemToTrash(path, false);
    }

    public async delete(path: string) {
        await system.fs.unlink(path);
    }

    public async getDirItemAttributes(dirPath: string, itemNames: string[]): Promise<Dictionary<string, { hidden: boolean, system: boolean }>> {

        return this.getUnixDirItemAttributes(itemNames);

        //return system.platform == "win32" ?
        //    await this.getWinDirItemAttributes(dirPath) :
        //    this.getUnixDirItemAttributes(itemNames);
    }

    public async getWinDirItemAttributes(dirPath: string): Promise<Dictionary<string, { hidden: boolean, system: boolean }>> {
        return new Promise<Dictionary<string, { hidden: boolean, system: boolean }>>((resolve, reject) => {
            let data = new Dictionary<string, { hidden: boolean, system: boolean }>();

            exec(`ls "${dirPath}" -Hidden | select Name, Attributes | format-list`,
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

                    let itemInfos = stdout
                        .trim()
                        .split(system.os.EOL + system.os.EOL);

                    for (var i = 0; i < itemInfos.length; i++) {
                        let itemInfoLines = itemInfos[i].split(system.os.EOL);
                        let itemName = itemInfoLines[0].split(':')[1].trim();
                        let attributes = itemInfoLines[1].split(':')[1].trim().split(', ');

                        data.addOrSet(itemName, {
                            hidden: !!attributes.find(x => x.indexOf("Hidden") >= 0),
                            system: !!attributes.find(x => x.indexOf("System") >= 0)
                        });
                    }

                    resolve(data);
                });
        });
    }

    public getUnixDirItemAttributes(itemNames: string[]): Dictionary<string, { hidden: boolean, system: boolean }> {
        let data = new Dictionary<string, { hidden: boolean, system: boolean }>();

        for (var i = 0; i < itemNames.length; i++) {
            let itemName = itemNames[i];
            data.addOrSet(itemName, this.getUnixMethodItemAttributes(itemName));
        }

        return data;
    }

    public getUnixMethodItemAttributes(itemName: string): { hidden: boolean, system: boolean } {
        return {
            hidden: itemName.startsWith('.'),
            system: false
        };
    }
}