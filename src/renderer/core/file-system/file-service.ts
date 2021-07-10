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
                system.path.join(dirPath, name),
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

    public async copy(source: FileSystemItem, targetPath: string, overwrite: boolean): Promise<void> {
        const targetPathExists = this.pathExists(targetPath);

        if (!overwrite && targetPathExists) {
            throw new Error(`Target path already exists: ${targetPathExists}`);
        }

        // TODO for a safer copy (also for move), copy to a temp file, then rename it
        await system.fs.copyFile(source.path, targetPath, !overwrite ? system.fss.constants.COPYFILE_EXCL : undefined);
    }

    public move(item: FileSystemItem, targetPath: string, overwrite?: boolean): Promise<void>;
    public move(item: FileSystemItem, targetDirectory: Directory, overwrite?: boolean): Promise<void>;

    public async move(item: FileSystemItem, target: string | Directory, overwrite: boolean = false): Promise<void> {
        if (overwrite !== true)
            overwrite = false;

        let targetPath: string;

        if (typeof target === 'string') {
            targetPath = target;
        }
        else {
            targetPath = system.path.join(target.path, item.name);
        }

        if (!overwrite && this.pathExists(targetPath)) {
            throw new Error(`Target path already exists: ${targetPath}`);
        }

        await system.fs.rename(item.path, targetPath);
    }

    public async rename(item: FileSystemItem, newName: string): Promise<void> {
        await this.move(item, system.path.join(item.directoryPath, newName));
    }

    public async moveToTrash(item: FileSystemItem) {
        return system.shell.moveItemToTrash(item.path, false);
    }

    public async delete(item: FileSystemItem) {
        if (item.isDir)
            await system.fs.rmdir(item.path, { recursive: true });
        else
            await system.fs.unlink(item.path);
    }

    public pathExists(path: string): boolean {
        return system.fss.existsSync(path);
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
                        const itemInfoLines = itemInfos[i].split(system.os.EOL);
                        const itemName = itemInfoLines[0].split(':')[1].trim();
                        const attributes = itemInfoLines[1].split(':')[1].trim().split(', ');

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