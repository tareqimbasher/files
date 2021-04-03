import { bindable } from "aurelia";
import { FileType, FileSystemItem, Directory } from "../../../../core";

export class FSItem {

    @bindable
    public item!: FileSystemItem;
    private static imgFormats = [".jpg", ".jpeg", ".png", ".gif", ".jfif", ".bmp", ".svg"];

    public icon(): string {
        if (this.item.extension && FSItem.imgFormats.indexOf(this.item.extension.toLocaleLowerCase()) >= 0)
            return this.thumbnail();
        else
            return `assets/icons/file-system/png/${this.getIconFile()}.png`;
    }

    private getIconFile(): string {
        if (this.item?.type == FileType.Directory)
            return "119-folder-22";

        if (this.item?.type == FileType.SymbolicLink)
            return "star";

        switch (this.item?.extension.toLowerCase()) {

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

            case ".eml": return "048-email";

            case ".js":
            case ".ts":
            case ".json":
            default:
                return "026-file-65";
        }
    }

    public thumbnail() {
        return 'atom://' + this.item?.path;
    }
}