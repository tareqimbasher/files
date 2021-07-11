export class Drive {
    constructor(
        public name: string,
        public path: string,
        public fileSystem: string,
        public size: number,
        public usedSize: number,
        public freeSize: number) {
    }
}
