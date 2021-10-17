import {
  DefaultDialogDom,
  IDialogController,
  IDialogDom,
  IDialogService,
} from "@aurelia/runtime-html";
import { IEventAggregator, ILogger, watch } from "aurelia";
import {
  FileService,
  FileSystemItem,
  FileSystemItemPropertiesChangedEvent,
  IconLoader,
  Settings,
} from "../../../core";
import { DialogBase } from "../../common";

export class ItemProperties extends DialogBase {
  item!: FileSystemItem;
  public editableInfo = {
    name: "",
    isHidden: false,
  };

  public icon = IconLoader.defaultIcon;
  public changePending = false;
  public dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  constructor(
    private readonly settings: Settings,
    private readonly fileService: FileService,
    @IDialogDom dialogDom: DefaultDialogDom,
    @IDialogController controller: IDialogController,
    @IEventAggregator private readonly eventBus: IEventAggregator,
    @ILogger private readonly logger: ILogger
  ) {
    super(dialogDom, controller);
  }

  public static async openAsDialog(
    dialogService: IDialogService,
    items: FileSystemItem[]
  ): Promise<void> {
    const opened = await dialogService.open({
      component: () => ItemProperties,
      model: items,
    });

    await opened.dialog.closed;
  }

  public activate(items: FileSystemItem[]) {
    this.item = items[0];

    if (this.item) {
      this.editableInfo.name = this.item.name;
      this.editableInfo.isHidden = this.item.isHidden;
    }
  }

  public attached() {
    IconLoader.getIcon(this.item).then((i) => (this.icon = i));
  }

  @watch((vm: ItemProperties) => vm.editableInfo.name)
  @watch((vm: ItemProperties) => vm.editableInfo.isHidden)
  public change() {
    if (!this.item) return;

    this.changePending =
      this.editableInfo.name != this.item.name || this.editableInfo.isHidden != this.item.isHidden;
  }

  public apply(): boolean {
    try {
      if (this.changePending) {
        if (!!this.editableInfo.name && this.item.name != this.editableInfo.name) {
          this.fileService.rename(this.item, this.editableInfo.name);
        }

        //if (this.item.isHidden != this.editableInfo.isHidden)
        //    this.item.isHidden = this.editableInfo.isHidden;

        this.eventBus.publish(new FileSystemItemPropertiesChangedEvent(this.item));
      }

      this.changePending = false;

      return true;
    } catch (ex) {
      this.logger.error("An error occurred applying changes.", ex);
      alert("Error occurred.");
      return false;
    }
  }

  public ok() {
    if (this.apply()) this.controller.ok();
  }

  public cancel() {
    this.controller.cancel();
  }
}
