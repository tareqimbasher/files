import { bindable, IEventAggregator, watch } from "aurelia";
import { KeyCode, Settings, system, ViewCommandEditAddressBarEvent, ViewCommandSearchEvent } from "../../../core";
import { Pane } from "../pane";

export class AddressBar {

    @bindable public pane!: Pane;
    public isEditAddress = false;
    public addressBarPath?: string;
    public addressInput!: HTMLInputElement;
    private detaches: Array<() => void> = [];

    constructor(public settings: Settings, @IEventAggregator private readonly eventBus: IEventAggregator) {
    }

    public attached() {
        this.addressBarPath = this.pane.tabs.active.path;

        let sub = this.eventBus.subscribe(ViewCommandEditAddressBarEvent, () => {
            if (this.pane.isActive)
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
        this.isEditAddress = true;
        setTimeout(() => {
            this.addressInput.focus();
            this.addressInput.select();
        }, 10);
    }

    @watch((vm: AddressBar) => vm.pane.tabs.active.path)
    public activeTabPathChanged() {
        this.addressBarPath = this.pane.tabs.active.path;
    }

    public async addressBarPathEdited(ev: KeyboardEvent) {
        // If pressed key is not ENTER or ESC keys, don't handle event
        if (ev.code != KeyCode.Enter && ev.code != KeyCode.Escape)
            return;

        if (ev.code == KeyCode.Enter && this.addressBarPath) { // Enter key

            let address = this.addressBarPath.trim();

            if (address.startsWith("~"))
                address = address.replace("~", system.os.homedir());
            else if (address.startsWith("/"))
                address = address.replace("/", system.path.parse(process.cwd()).root);

            if (!system.fss.existsSync(address)) {
                alert("Invalid path: " + address);
            }
            else {
                let stat = await system.fs.stat(address);
                if (stat.isDirectory()) {
                    this.pane.tabs.active.setPath(address);
                }
                else {
                    system.shell.openExternal(address);
                }
            }
        }

        this.addressBarPath = this.pane.tabs.active.path;
        this.isEditAddress = false;
    }

    public async addressPartSelected(selectedPartIndex: number) {
        let activeTab = this.pane.tabs.active;
        if (activeTab.pathParts.length - 1 == selectedPartIndex)
            return;

        let newPath = system.path.join(...activeTab.pathParts.slice(0, selectedPartIndex + 1));
        activeTab.setPath('/' + newPath);
    }
}