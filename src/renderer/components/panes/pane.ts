import { bindable, EventAggregator, IDisposable, watch } from "aurelia";
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
    private detaches: Array<() => void> = [];

    constructor(public settings: Settings, private eventBus: EventAggregator) {
    }

    public attached() {
        this.info.tabs.refreshTabBinding();
        this.addressBarPath = this.info.tabs.active.path;

        let sub = this.eventBus.subscribe("kb-address-edit", (msg: any) => {
            if (this.info.id == msg.id)
                this.enableEditAddress();
        });
        this.detaches.push(() => sub.dispose());

        let f = (ev: KeyboardEvent) => this.addressBarPathEdited(ev);
        this.addressInput.addEventListener("keydown", f);
        this.detaches.push(() => this.addressInput.removeEventListener("keydown", f));
    }

    public detached() {
        this.detaches.forEach(f => f());
    }

    public enableEditAddress() {
        this.editAddress = true;
        setTimeout(() => {
            this.addressInput.focus();
            this.addressInput.select();
        }, 10);
    }

    @watch((vm: Pane) => vm.info.tabs.active.path)
    public activeTabPathChanged() {
        this.addressBarPath = this.info.tabs.active.path;
    }

    public async addressBarPathEdited(ev: KeyboardEvent) {
        // If pressed key is not ENTER or ESC keys, don't handle event
        if (ev.which != 13 && ev.which != 27)
            return;

        if (ev.which == 13) { // Enter key
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
                        this.info.tabs.active.setPath(this.addressBarPath);
                    }
                    else {
                        shell.openExternal(this.addressBarPath);
                    }
                }
            }
        }

        this.addressBarPath = this.info.tabs.active.path;
        this.editAddress = false;
    }
}
