import { system } from "../system/system";
import { FileSystemItem } from "./file-system-item";
import { FileType } from "./file-system-item-type";

export class IconLoader {

    public static defaultIcon = `${system.fileScheme}://assets/icons/file-system/png/026-file-65.png`;
    private static imgFormats = [".jpg", ".jpeg", ".png", ".gif", ".jfif", ".bmp", ".svg"];

    public static async getIcon(item: FileSystemItem): Promise<string> {
        if (item.extension && IconLoader.imgFormats.indexOf(item.extension.toLocaleLowerCase()) >= 0)
            return this.thumbnail(item);
        else if (item.extension.toLowerCase() == ".exe") {
            let icon = await system.app.getFileIcon(item.path, { size: "large" });
            return icon.toDataURL();
        }
        else
            return `${system.fileScheme}://assets/icons/file-system/png/${this.localIcon(item)}.png`;
    }

    private static localIcon(item: FileSystemItem): string {
        if (item.type == FileType.Directory)
            return "119-folder-22";

        if (item.type == FileType.SymbolicLink)
            return "star";

        switch (item.extension.toLowerCase()) {

            // Documents
            case ".pdf": return "023-pdf-1";
            case ".docx":
            case ".doc":
                return "052-doc-3";
            case ".xlsx":
            case ".xls":
                return "077-xls";
            case ".txt": return "078-txt";

            // Media
            case ".mp3":
            case ".wav":
            case ".ogg":
                return "017-audio-file";
            case ".mp4":
            case ".wmv":
            case ".avi":
            case ".mov":
            case ".3gp":
                return "003-video-file-2";
            case ".mkv": return "033-mkv-2";
            case ".flv": return "043-flv";

            // Archives
            case ".zip": return "183-zip-file";
            case ".rar":
            case ".tar":
            case ".tz":
            case ".7z":
                return "114-archive-1";

            case ".html":
            case ".htm":
                return "185-html";

            case ".psd": return "019-psd-1";
            case ".ai": return "150-ai";
            case ".aep":
            case ".aepx":
                return "after-effects";
            case ".cdr": return "146-cdr";
            case ".sketch": return "095-sketch";

            case ".css": return "060-css";
            case ".php": return "210-php";
            case ".swf": return "009-swf";
            case ".ps": return "120-ps";

            case ".iso": return "121-iso";

            case ".cert":
            case ".crt":
            case ".pfx":
                return "075-certificate-2";

            case ".lock":
            case ".lck":
                return "045-file-58";

            case ".eml": return "048-email";

            case ".js":
            case ".ts":
            case ".json":
            default:
                return "026-file-65";
        }
    }

    private static thumbnail(item: FileSystemItem): string {
        return `${system.fileScheme}://${item.path}`;
    }
}