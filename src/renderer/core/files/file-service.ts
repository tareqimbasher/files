import { promises as fs } from 'fs';
import * as paths from 'path';
import { File } from './file';

export class FileService {
	public async list(path: string): Promise<File[]> {
		let fileNames = await fs.readdir(path);
		return fileNames.map(n => new File(paths.join(path, n)));
	}
}