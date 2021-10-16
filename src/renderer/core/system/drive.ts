export class Drive {
    constructor(
        public name: string,
        public path: string,
        public fileSystem: string,
        public size: number,
        public usedSize: number,
        public freeSize: number) {
    }

    public get usedPercent(): number {
        return Math.round((this.usedSize / this.size) * 100);
    }

    public get freePercent(): number {
        return Math.round((this.freeSize / this.size) * 100);
    }
}
