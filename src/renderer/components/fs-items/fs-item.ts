import { bindable } from "aurelia";
import { FileType, FileSystemItem } from "../../core";

export class FSItem {

    @bindable
    public item?: FileSystemItem;

    public get icon(): string {
        if (this.item?.type == FileType.Directory)
            return "blue folder";

        if (this.item?.type == FileType.SymbolicLink)
            return "star";

        switch (this.item?.extension.toLowerCase()) {
            case ".jpg": return "file image";
            case ".pdf": return "red file pdf";
            case ".mp4": return "file video outline";
            case ".docx": return "blue file word";
            case ".xlsx": return "green file excel";
            case ".zip": return "yellow file archive";
            case ".xml": return "purple file code";
            case ".json": return "orange file code outline";
            default:
                return "file outline";
        }
    }

    public thumb() {
        return 'atom://' + this.item?.path;
    }
}