import { PaneInfo } from "../pane-info";
import { TabInfo } from "./tab-info";
import * as os from "os";

export class Tabs {
    public pane: PaneInfo;
    public list: TabInfo[] = [];
    public active!: TabInfo;

    constructor(pane: PaneInfo) {
        this.pane = pane;
        this.setActive(this.add());
    }

    public add(path?: string): TabInfo {
        if (!path)
            path = os.homedir();

        let tab = new TabInfo(this, path);
        this.list.push(tab);

        // Semantic UI
        this.refreshTabBinding();

        return tab;
    }

    public remove(tab: TabInfo) {
        let ix = this.list.indexOf(tab);

        let newActive: TabInfo;
        if (this.list.length > 1) {
            newActive = ix == 0 ? this.list[1] : this.list[ix - 1];
            this.setActive(newActive);
        }

        this.list.splice(ix, 1);
    }

    public setActive(tab: TabInfo) {
        if (this.active == tab)
            return;

        if (this.active)
            this.active.isActive = false;

        tab.isActive = true;
        this.active = tab;

        // Semantic UI
        this.findTabs().tab("change tab", tab.id);
    }

    public refreshTabBinding() {
        let tabs = this.findTabs();
        tabs.tab('destroy');
        tabs.tab({
            onVisible: (tabId: string) => {
                this.list.find(x => x.id == tabId)?.activate();
                //this.addressBarPath = this.info.tabs.active.path;
            }
        });
    }

    private findTabs(): any {
        return $(`pane[data-id='${this.pane.id}'] tab.item`);
    }
}