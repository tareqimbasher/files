import { bindable, IEventAggregator, watch } from "aurelia";
import { Settings, ViewCommandEditAddressBarEvent } from "application";
import { Pane } from "../../panes/pane";
import { KeyCode, system } from "common";

export class AddressBar {
  @bindable public pane!: Pane;
  public isEditAddress = false;
  public addressBarPath?: string;
  public addressInput!: HTMLInputElement;
  private detaches: Array<() => void> = [];

  constructor(
    public settings: Settings,
    @IEventAggregator private readonly eventBus: IEventAggregator
  ) {}

  public attached() {
    this.setAddressBarPathFromActivePath();

    const sub = this.eventBus.subscribe(ViewCommandEditAddressBarEvent, () => {
      if (this.pane.isActive) this.enableEditAddress();
    });
    this.detaches.push(() => sub.dispose());
  }

  public detached() {
    this.detaches.forEach((f) => f());
  }

  public enableEditAddress() {
    this.setAddressBarPathFromActivePath();
    this.isEditAddress = true;
    setTimeout(() => {
      this.addressInput.focus();
      this.addressInput.select();
    }, 100);
  }

  public async addressBarPathEdited(ev: KeyboardEvent) {
    // If pressed key is not ENTER or ESC keys, don't handle event
    if (ev.code != KeyCode.Enter && ev.code != KeyCode.Escape) return;

    if (ev.code == KeyCode.Enter && this.addressBarPath) {
      // Enter key

      let address = this.addressBarPath.trim();

      if (address.startsWith("~")) address = address.replace("~", system.os.homedir());
      else if (address.startsWith("/"))
        address = address.replace("/", system.path.parse(process.cwd()).root);

      if (!(await system.fs.pathExists(address))) {
        alert("Path does not exit: " + address);
      } else {
        const stat = await system.fs.stat(address);
        if (stat.isDirectory()) {
          this.pane.tabs.active.setPath(address);
        } else {
          system.shell.openExternal(address);
        }
      }
    }

    this.setAddressBarPathFromActivePath();
    this.isEditAddress = false;
  }

  public async addressPartSelected(selectedPartIndex: number) {
    const activeTab = this.pane.tabs.active;
    if (activeTab.pathParts.length - 1 == selectedPartIndex) return;

    const newPath = system.path.join(...activeTab.pathParts.slice(0, selectedPartIndex + 1));
    activeTab.setPath(newPath);
  }

  @watch((vm: AddressBar) => vm.pane.tabs.active.path)
  public setAddressBarPathFromActivePath() {
    this.addressBarPath = this.pane.tabs.active.path;
  }
}
