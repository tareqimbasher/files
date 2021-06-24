import { IDialogDom, DefaultDialogDom, IDialogController } from '@aurelia/runtime-html';
import { IEventAggregator, ILogger, watch } from 'aurelia';
import { DialogBase, FileSystemItem, FileSystemItemPropertiesChangedEvent, IconLoader, Settings } from "../../../core";

export class ItemProperties extends DialogBase {
    item!: FileSystemItem;
    public editableInfo = {
        name: '',
        isHidden: false,
    }

    public icon = IconLoader.defaultIcon;
    public changePending = false;
    public dateOptions = {
        weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    constructor(
        public settings: Settings,
        @IDialogDom dialogDom: DefaultDialogDom,
        @IDialogController controller: IDialogController,
        @IEventAggregator private readonly eventBus: IEventAggregator,
        @ILogger private readonly logger: ILogger) {
        super(dialogDom, controller);
    }

    public activate(items: FileSystemItem[]) {
        this.item = items[0];

        if (this.item) {
            this.editableInfo.name = this.item.name;
            this.editableInfo.isHidden = this.item.isHidden;
        }
    }

    public attached() {
        IconLoader.getIcon(this.item).then(i => this.icon = i);
    }

    @watch((vm: ItemProperties) => vm.editableInfo.name)
    @watch((vm: ItemProperties) => vm.editableInfo.isHidden)
    public change() {
        if (!this.item)
            return;

        this.changePending =
            this.editableInfo.name != this.item.name
            || this.editableInfo.isHidden != this.item.isHidden;
    }

    public apply(): boolean {

        try {
            if (this.changePending) {
                if (this.item.name != this.editableInfo.name) {
                    this.item.name = this.editableInfo.name;
                    // but if name changes, so does path, ext...etc
                }

                if (this.item.isHidden != this.editableInfo.isHidden)
                    this.item.isHidden = this.editableInfo.isHidden;

                this.eventBus.publish(new FileSystemItemPropertiesChangedEvent(this.item));
            }

            return true;
        } catch (ex) {
            this.logger.error("An error occurred applying changes.", ex);
            alert("Error occurred.");
            return false;
        }

    }

    public ok() {
        if (this.apply())
            this.controller.ok();
    }

    public cancel() {
        this.controller.cancel();
    }
}