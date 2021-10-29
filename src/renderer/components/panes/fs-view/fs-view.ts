import { bindable, ILogger, watch } from "aurelia";
import { Tab } from "../tabs/tab";
import { CommonTasksService, FileService, FsItems, Settings } from "core";
import { FsViewSorting } from "./fs-view-sorting";
import { AlertDialogHelper, Clipboard } from "../../common";
import { KeyCode, Util } from "common";
import { FsViewDragNDrop } from "./fs-view-drag-n-drop";
import { FsViewMouseControls } from "./fs-view-mouse-controls";

export class FsView {
  public id: string;

  @bindable public tab!: Tab;
  @bindable public fsItems!: FsItems;

  private sorting: FsViewSorting;
  private contextMenu!: HTMLElement;
  private detaches: (() => void)[] = [];
  private dnd?: FsViewDragNDrop;

  constructor(
    private readonly fileService: FileService,
    private readonly settings: Settings,
    public readonly element: HTMLElement,
    private readonly commonTasksService: CommonTasksService,
    private readonly clipboard: Clipboard,
    private readonly alertDialogHelper: AlertDialogHelper,
    @ILogger private readonly logger: ILogger
  ) {
    this.id = Util.newGuid();
    this.sorting = new FsViewSorting();
  }

  public attached() {
    new FsViewMouseControls(
      this.id,
      this.element,
      this,
      this.contextMenu,
      this.detaches
    ).bindMouseEvents();
    this.bindKeyboardEvents();

    this.dnd = new FsViewDragNDrop(
      this.element,
      this,
      this.detaches,
      this.settings,
      this.fileService,
      this.alertDialogHelper
    );

    this.initDragAndDrop();
  }

  public detaching() {
    this.detaches.forEach((f) => f());
  }

  private bindKeyboardEvents() {
    const keyHandler = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && !ev.altKey) {
        if (ev.code === KeyCode.KeyA) {
          this.fsItems.selectAll();
          ev.preventDefault();
        } else if (ev.code === KeyCode.KeyC) {
          this.commonTasksService.copySelectedItems();
        } else if (ev.code === KeyCode.KeyX) {
          this.commonTasksService.cutSelectedItems();
        } else if (ev.code === KeyCode.KeyV) {
          this.commonTasksService.pasteItems();
        }
      } else if (!ev.ctrlKey && !ev.altKey) {
        if (ev.code === KeyCode.Enter && this.fsItems.selected.length > 0) {
          this.commonTasksService.openSelected();
        } else if (ev.shiftKey && ev.code === KeyCode.Delete) {
          this.commonTasksService.deleteSelected(true);
        } else if (ev.code === KeyCode.Delete) {
          this.commonTasksService.deleteSelected(false);
        }
      }
    };

    this.element.addEventListener("keydown", keyHandler);
    this.detaches.push(() => this.element.removeEventListener("keydown", keyHandler));
  }

  @watch((vm: FsView) => vm.tab.path)
  private async initDragAndDrop() {
    await this.dnd?.InitDragAndDrop();
  }
}
