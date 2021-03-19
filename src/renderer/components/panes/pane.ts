import { Util } from "../../core";
import { Tab } from "./tabs/tab";

export class Pane {
    public id: string;
    public paths: string[] = [];
    public editAddress = false;
    private tabsElement!: HTMLElement;
    

    constructor() {
        this.id = Util.newGuid();
        this.paths.push(
            "C:/",
            "C:/tmp",
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
}
