import * as pathUtil from 'path';
import { system } from '../system/system';
import { Directory } from './directory';
import { File } from './file';
import { FileSystemItem } from './file-system-item';
import { SymbolicLink } from './symbolic-link';
import { exec } from "child_process";
import { Dictionary } from '../data/dictionary';
import { ILogger } from 'aurelia';

export class FileService {

    constructor(@ILogger private readonly logger: ILogger) {
    }

    public async list(dirPath: string): Promise<FileSystemItem[]> {
        let itemNames = await system.fs.readdir(dirPath);

        let itemInfos = system.platform == "win32" ?
            await this.getWinInfo(dirPath) :
            this.getUnixInfo(itemNames);

        let items: FileSystemItem[] = [];
        for (let name of itemNames) {
            let path = pathUtil.join(dirPath, name);
            try {
                let stats = await system.fs.stat(path);
                let item: FileSystemItem;

                if (stats.isFile()) {
                    item = new File(path);
                }
                else if (stats.isDirectory()) {
                    item = new Directory(path);
                }
                else if (stats.isSymbolicLink()) {
                    item = new SymbolicLink(path);
                }
                else
                    continue;


                if (itemInfos.containsKey(name)) {
                    let itemInfo = itemInfos.get(name);
                    if (itemInfo) {
                        item.isHidden = itemInfo.hidden;
                        item.isSystem = itemInfo.system;
                    }
                }

                items.push(item);

            } catch (ex) {
                this.logger.error(`Could not read file: ${name}`, ex);
            }
        }

        return items;
    }

    public async moveToTrash(path: string) {
        return system.shell.moveItemToTrash(path, false);
    }

    private async getWinInfo(path: string) {
        return new Promise<Dictionary<string, { hidden: boolean, system: boolean }>>((resolve, reject) => {
            let data = new Dictionary<string, { hidden: boolean, system: boolean }>();

            exec(`ls "${path}" -Hidden | select Name, Attributes | format-list`,
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

    private getUnixInfo(itemNames: string[]) {
        let data = new Dictionary<string, { hidden: boolean, system: boolean }>();

        for (var i = 0; i < itemNames.length; i++) {
            let itemName = itemNames[i];
            data.addOrSet(itemName, {
                hidden: itemName.startsWith('.'),
                system: false
            });
        }

        return data;
    }
}