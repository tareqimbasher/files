export class FileSizeValueConverter {
    public toView(size: number): string {
        if (size === undefined || size === null)
            return '';

        if (typeof size === 'string') {
            const sizeStr = (size as string).trim();
            if (sizeStr == '') return '';
            else size = Number(sizeStr);
        }

        if (size === 0)
            return "0 bytes";

        let i = Math.floor(Math.log(size) / Math.log(1024));
        let sizeStr = (size / Math.pow(1024, i)).toFixed(2);
        if (sizeStr.endsWith(".00"))
            sizeStr = sizeStr.slice(0, -3);
        return sizeStr + ' ' + ['bytes', 'KB', 'MB', 'GB', 'TB'][i];
    }
}