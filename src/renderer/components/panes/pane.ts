import { bindable } from "aurelia";
import { Settings } from "../../core";
import { PaneInfo } from "./pane-info";

export class Pane {

    @bindable public info!: PaneInfo;

    public addressBarPath?: string;
    public editAddress = false;
    public addressInput!: HTMLInputElement;

    constructor(public settings: Settings) {
    }

    public attached() {
        this.bindTabs();
        this.info.currentPath = this.info.paths[0];
        this.addressBarPath = this.info.currentPath.path;
    }

    public openNewTab(path?: string) {
        let tabs = this.findTabs();
        (tabs as any).tab('destroy');

        let pathInfo = this.info.addTab(path);
        tabs = this.findTabs();
        this.bindTabs();

        // Works better than calling change tab
        tabs.filter(`[data-tab='${pathInfo.id}']`).click();

        //($ as any).tab("change tab", pathInfo.id);
        // Fix, semantic is switching the view but not selecting the actual tab
        //tabs.removeClass("active");
        //tabs.filter(`[data-tab='${pathInfo.id}']`).addClass("active");
    }

    private findTabs() {
        return $(`pane[data-id='${this.info.id}'] tab.item`);
    }

    private bindTabs() {
        let tabs = (this.findTabs() as any);
        tabs.tab({
            onVisible: (tabId: string) => {
                console.log(tabId);
                this.info.currentPath = this.info.paths.find(x => x.id == tabId);
                this.addressBarPath = this.info.currentPath?.path;
            }
        });
    }

    public enableEditAddress() {
        this.editAddress = true;
        setTimeout(() => this.addressInput.focus(), 1);
    }
}
