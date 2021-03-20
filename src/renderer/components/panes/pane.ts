import { Util } from "../../core";

export class Pane {
    public id: string;
    public paths: string[] = [];
    public editAddress = false;
    private tabsElement!: HTMLElement;
    private addressInput!: HTMLInputElement;

    constructor() {
        this.id = Util.newGuid();
        this.paths.push(
            "C:/tmp",
            "C:/",
            "D:/Libraries/Pictures",
            //"C:/Users/TIPS/Pictures",
            "C:/Users/TIPS/Downloads"
        );
    }

    public attached() {
        ($(this.tabsElement).find('.item') as any).tab();
    }

    public openNewTab(path?: string) {
        this.paths.push(path || "C:/");
        let tabs = ($(this.tabsElement).find('.item') as any);
        tabs.tab('destroy');
        tabs.tab();
    }

    public enableEditAddress() {
        this.editAddress = true;
        setTimeout(() => this.addressInput.focus(), 1);
    }
}
