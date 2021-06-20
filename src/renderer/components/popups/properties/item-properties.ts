import { IDialogDom, DefaultDialogDom, IDialogController } from '@aurelia/runtime-html';
import { observable } from '@aurelia/runtime';
import { watch } from 'aurelia';
import { DialogBase, FileSystemItem, IconLoader, Settings } from "../../../core";

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
        @IDialogController controller: IDialogController) {
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

    public apply() {
        alert("test: Apply");
    }

    public ok() {
        alert("test: OK");
    }

    public cancel() {
        this.controller.cancel();
    }
}