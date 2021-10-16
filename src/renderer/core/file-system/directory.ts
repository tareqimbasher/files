import { system } from '../system/system';
import { Util } from '../utils/util';
import { FileSystemItem } from './file-system-item';
import { FileType } from './file-system-item-type';

export class Directory extends FileSystemItem {

    public directoriesCount = 0;
    public filesCount = 0;
    public filesTotalSize = 0;
    public containingItemsChanged: () => void;

    constructor(path: string) {
        super(path, FileType.Directory);
        this.containingItemsChanged = () => {return;};//Util.debounce(this, this.updateContainingItemInfo, 1000, true);
    }

    public get itemCount() {
        return this.directoriesCount + this.filesCount;
    }

    private async updateContainingItemInfo() {
        this.directoriesCount = 0;
        this.filesCount = 0;

        await system.fs.readdir(this.path).then(async items => {
            let dirs = 0;
            let files = 0;
            let fileSizes = 0;

            for (const itemName of items) {
                try {
                    const stats = await system.fs.stat(system.path.join(this.path, itemName));
                    if (stats.isDirectory())
                        dirs++
                    else {
                        files++;
                        fileSizes += stats.size;
                    }
                } catch (ex) {
                    this.filesCount++;
                    //console.error(`Could not get file stats of: ${ex}`);
                }
            }

            this.directoriesCount = dirs;
            this.filesCount = files;
            this.filesTotalSize = fileSizes;
        }).catch(err => {
            console.error(`Could not get file count of dir: ${this.path}`, err);
        });
    }
}