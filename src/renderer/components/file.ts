import { bindable } from "aurelia";
import { FileType } from "../core";
import { File as F } from "../core/file-system/file";

export class File {

    @bindable
    public file?: F;

    public get icon(): string {
        if (this.file?.type == FileType.Directory)
            return "blue folder";

        if (this.file?.type == FileType.SymbolicLink)
            return "";

        switch (this.file?.extension.toLowerCase()) {
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
}