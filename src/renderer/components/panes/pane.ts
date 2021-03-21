import { bindable, EventAggregator, IDisposable } from "aurelia";
import { Settings } from "../../core";
import { PaneInfo } from "./pane-info";
import * as fs from "fs";
import { shell } from "electron";
import * as os from "os";
import * as path from "path";

export class Pane {

    @bindable public info!: PaneInfo;

    public addressBarPath?: string;
    public editAddress = false;
    public addressInput!: HTMLInputElement;
    private disposables: IDisposable[] = [];

    constructor(public settings: Settings, private eventBus: EventAggregator) {
        console.log(eventBus);
    }

    public attached() {
        this.bindTabs();
        this.info.currentPath = this.info.paths[0];
        this.addressBarPath = this.info.currentPath.path;

        this.disposables.push(this.eventBus.subscribe("address-edit", (msg: any) => {
            if (this.info.id == msg.id)
                this.enableEditAddress();
        }));
    }

    public detached() {
        this.disposables.forEach(d => d.dispose());
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
        setTimeout(() => {
            this.addressInput.focus();
            this.addressInput.select();
        }, 10);
    }

    public async addressBarPathEdited(ev: Event) {
        ev.preventDefault();

        if (this.addressBarPath) {
            this.addressBarPath = this.addressBarPath.trim();
            if (this.addressBarPath.startsWith("~"))
                this.addressBarPath = this.addressBarPath.replace("~", os.homedir());
            else if (this.addressBarPath.startsWith("/"))
                this.addressBarPath = this.addressBarPath.replace("/", path.parse(process.cwd()).root);

            if (!fs.existsSync(this.addressBarPath)) {
                alert("Invalid path: " + this.addressBarPath);
            }
            else {
                let stat = await fs.promises.stat(this.addressBarPath);
                if (stat.isDirectory()) {
                    this.info.currentPath?.setPath(this.addressBarPath);
                }
                else {
                    shell.openExternal(this.addressBarPath);
                }
            }
        }

        this.addressBarPath = this.info.currentPath?.path;
        this.editAddress = false;
    }
}
