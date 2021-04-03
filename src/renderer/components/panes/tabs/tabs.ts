import { Pane } from "../pane";
import { Tab } from "./tab";
import * as os from "os";

export class Tabs {
    public pane: Pane;
    public list: Tab[] = [];
    public active!: Tab;

    constructor(pane: Pane) {
        this.pane = pane;
        this.setActive(this.add());
    }

    public add(path?: string): Tab {
        if (!path)
            path = os.homedir();

        let tab = new Tab(this, path);
        this.list.push(tab);

        // Semantic UI
        this.refreshTabBinding();

        return tab;
    }

    public remove(tab: Tab) {
        let ix = this.list.indexOf(tab);

        let newActive: Tab;
        if (this.list.length > 1) {
            newActive = ix == 0 ? this.list[1] : this.list[ix - 1];
            this.setActive(newActive);
        }

        this.list.splice(ix, 1);
    }

    public setActive(tab: Tab) {
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
                //this.addressBarPath = this.pane.tabs.active.path;
            }
        });
    }

    private findTabs(): any {
        return $(`pane-view[data-id='${this.pane.id}'] tab-view.item`);
    }
}