import { EventAggregator, singleton } from "aurelia";

@singleton
export class Settings {
    public theme!: string;
    public inverted!: string;
    public showHiddenFiles!: boolean;
    public fileViewType: FileViewTypes = FileViewTypes.Icons;

    constructor(private eventBus: EventAggregator) {
    }

    public setTheme(theme: string) {
        this.theme = theme;
        this.inverted = theme == "dark" ? "inverted" : "";
        this.eventBus.publish('settings-changed');
    }

    public toggleTheme() {
        this.setTheme(this.theme === "dark" ? "light" : "dark");
    }

    public setShowHiddenFiles(show: boolean) {
        this.showHiddenFiles = show;
        this.eventBus.publish('show-hidden-changed');
        this.eventBus.publish('settings-changed');
    }

    public setFileViewType(fileViewType: FileViewTypes) {
        if (this.fileViewType == fileViewType)
            return;
        this.fileViewType = fileViewType;
        this.eventBus.publish('settings-changed');
    }

    public toggleFileViewType() {
        this.setFileViewType(this.fileViewType == FileViewTypes.Icons ? FileViewTypes.Details : FileViewTypes.Icons);
    }
}

export enum FileViewTypes {
    Icons = "Icons",
    Details = "Details"
}