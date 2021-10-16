import { IDialogService, observable, watch } from "@aurelia/runtime-html";
import { IEventAggregator } from "aurelia";
import { Settings, ViewCommandSearchEvent } from "../../core";
import { WindowManager } from "../window-manager";
import { KeyboardShortcuts } from "../dialogs/keyboard-shortcuts/keyboard-shortcuts";

export class Header {
    @observable public searchTerm?: string;
    private searchInput!: HTMLInputElement;
    private detaches: Array<() => void> = [];

    constructor(
        private readonly settings: Settings,
        private readonly windowManager: WindowManager,
        @IDialogService private readonly dialogService: IDialogService,
        @IEventAggregator private readonly eventBus: IEventAggregator) {
    }

    public attached() {
        let sub = this.eventBus.subscribe(ViewCommandSearchEvent, () => {
            this.searchInput.focus();
            this.searchInput.select();
        });
        this.detaches.push(() => sub.dispose());
    }

    public detached() {
        this.detaches.forEach(f => f());
    }

    public get activeTab() {
        return this.windowManager.panes.active.tabs.active;
    }
    
    public async showKeyboardShortcuts() {
        await KeyboardShortcuts.openAsDialog(this.dialogService);
    }

    @watch<Header>(vm => vm.activeTab.path)
    private pathChanged() {
        this.searchTerm = undefined;
    }

    private searchTermChanged() {
        this.activeTab.fsItems.search(this.searchTerm);
    }
}