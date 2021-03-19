import { promises as fs } from 'fs';
import * as pathUtil from 'path';
import { Directory } from './directory';
import { File } from './file';
import { FileSystemItem } from './file-system-item';
import { SymbolicLink } from './symbolic-link';

export class FileService {
	public async list(dirPath: string): Promise<FileSystemItem[]> {
		let fileNames = await fs.readdir(dirPath);
		let items: FileSystemItem[] = [];

		for (let name of fileNames) {
			let path = pathUtil.join(dirPath, name);
            try {
				let stats = await fs.stat(path);

				if (stats.isFile()) {
					items.push(new File(path));
				}
				else if (stats.isDirectory()) {
					items.push(new Directory(path));
				}
				else if (stats.isSymbolicLink()) {
					items.push(new SymbolicLink(path));
				}
			} catch (ex) {
				console.error(`Could not read file: ${name}`);
            }
        }

		return items;
	}
}