import { Pane } from '../pane';
import { Tab } from './tab';
import * as os from 'os';
import { IContainer, IDisposable } from 'aurelia';

export class Tabs implements IDisposable {
    public pane: Pane;
    public list: Tab[] = [];
    public active!: Tab;

    constructor(pane: Pane, private container: IContainer) {
        this.pane = pane;
        this.setActive(this.add());

        // A simple way of getting tab dragging to work
        //setTimeout(() => {
        //    let elms = Array.from(document.getElementsByClassName("tabular"));
        //    dragula(elms);
        //}, 1000);
    }

    public add(path?: string): Tab {
        if (!path)
            path = os.homedir();

        const tab = new Tab(this, path, this.container);
        this.list.push(tab);

        // Semantic UI
        this.refreshTabBinding();

        return tab;
    }

    public remove(tab: Tab) {
        if (this.list.length == 1)
            return;

        try {
            const ix = this.list.indexOf(tab);

            if (this.list.length > 1) {
                const newActive = ix == 0 ? this.list[1] : this.list[ix - 1];
                this.setActive(newActive);
            }

            this.list = this.list.filter((tab, index) => index != ix);

            this.refreshTabBinding();
        } finally {
            tab.dispose();
        }
    }

    public setActive(tab: Tab) {
        if (this.active == tab)
            return;

        if (this.active)
            this.active.isActive = false;

        tab.isActive = true;
        this.active = tab;

        // Semantic UI
        this.findTabs().tab('change tab', tab.id);
    }

    public refreshTabBinding() {
        const tabs = this.findTabs();
        tabs.tab('destroy');
        tabs.tab({
            onVisible: (tabId: string) => {
                this.list.find(x => x.id == tabId)?.activate();
                //this.addressBarPath = this.pane.tabs.active.path;
            }
        });
    }

    public dispose(): void {
        for (const tab of this.list) {
            this.remove(tab);
        }
    }

    private findTabs(): any {
        return $(`pane-view[data-id='${this.pane.id}'] tab-view.item`);
    }
}