import { File, FileService } from "./core";

export class Home {
    public message = 'Files';

    public files: File[] = [];

    constructor(private fileService: FileService) {
    }

    public async test() {
        this.files = await this.fileService.list('/tmp');
    }
}
