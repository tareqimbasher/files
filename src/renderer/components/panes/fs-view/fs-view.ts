import { IDialogService } from "@aurelia/runtime-html";
import { bindable, ILogger, watch } from "aurelia";
import { Tab } from "../tabs/tab";
import SelectionArea from "@simonwep/selection-js";
import {
  delay,
  Directory,
  FileService,
  FileSystemItem,
  FsItems,
  KeyCode,
  Settings,
  system,
  UiUtil,
  Util,
} from "../../../core";
import dragula from "dragula";
import "dragula/dist/dragula.css";
import { ItemProperties } from "../../dialogs/properties/item-properties";
import { FsViewSorting } from "./fs-view-sorting";
import {
  AlertDialogButtonType,
  AlertDialogHelper,
  AlertDialogType,
  Clipboard,
  ClipboardItemType,
} from "../../common";

export class FsView {
  public id: string;

  @bindable public tab!: Tab;
  @bindable public fsItems!: FsItems;

  private sorting: FsViewSorting;
  private itemList!: HTMLElement;
  private contextMenu!: HTMLElement;
  private detaches: (() => void)[] = [];
  private drake?: dragula.Drake;

  constructor(
    private readonly fileService: FileService,
    private readonly settings: Settings,
    private readonly element: HTMLElement,
    private readonly clipboard: Clipboard,
    @IDialogService private readonly dialogService: IDialogService,
    private readonly alertDialogHelper: AlertDialogHelper,
    @ILogger private readonly logger: ILogger
  ) {
    this.id = Util.newGuid();
    this.sorting = new FsViewSorting();
  }

  public attached() {
    this.bindMouseEvents();
    this.bindKeyboardEvents();
    this.initDragAndDrop();
  }

  public detaching() {
    this.detaches.forEach((f) => f());
  }

  public openSelected() {
    let fsItems = this.fsItems.selected;

    // TODO handle multiple directories selected or mix of dir and files
    // Currently if a directory is selected we will only handle that dir
    const dir = fsItems.find((f) => f instanceof Directory);
    if (dir) fsItems = [dir];

    for (const fsItem of fsItems) {
      try {
        if (fsItem instanceof Directory) {
          this.tab.setPath(fsItem.path);
        } else {
          system.shell.openExternal(fsItem.path);
        }
      } catch (ex) {
        this.logger.error(ex);
      }
    }
  }

  public copySelectedItems() {
    const fsItems = this.fsItems.selected;

    if (!fsItems.length) return;

    this.clipboard.addCopyItems(...fsItems);
  }

  public cutSelectedItems() {
    const fsItems = this.fsItems.selected;

    if (!fsItems.length) return;

    this.clipboard.addCutItems(...fsItems);
  }

  public async pasteItems() {
    if (!this.clipboard.items.length) return;

    let targetDirPath: string;

    if (this.fsItems.selected.length === 1 && this.fsItems.selected[0].isDir)
      targetDirPath = this.fsItems.selected[0].path;
    else targetDirPath = this.tab.path;

    for (const ci of this.clipboard.items) {
      const targetPath = system.path.join(targetDirPath, ci.item.name);

      const actionVerb = ci.type === ClipboardItemType.Copy ? "copied" : "moved";

      if (this.fileService.pathExists(targetPath)) {
        await this.alertDialogHelper.alert(
          ci.type,
          `Destination: '${targetPath}' aleady exists. This item will not be ${actionVerb}.`,
          AlertDialogType.Warning
        );
        continue;
      }

      try {
        if (ci.type === ClipboardItemType.Copy) {
          await this.fileService.copy(ci.item, targetPath, false);
        } else if (ci.type === ClipboardItemType.Cut) {
          await this.fileService.move(ci.item, targetPath);
        }
      } catch (ex) {
        await this.alertDialogHelper.alert(
          `${ci.type} Error`,
          `'${ci.item.name}' was not ${actionVerb}.\n${ex}`,
          AlertDialogType.Error
        );
        break;
      }
    }

    this.clipboard.clear();
  }

  public async deleteSelected(permanent = false) {
    const fsItems = this.fsItems.selected;
    if (!fsItems.length) return;

    const items = fsItems.length === 1 ? `'${fsItems[0].name}'` : `${fsItems.length} items`;

    if (
      !permanent &&
      (await this.alertDialogHelper.confirm(
        "Move to Trash",
        `Are you sure you want to move ${items} to the trash?`,
        "Trash",
        AlertDialogButtonType.Danger
      ))
    ) {
      for (const item of fsItems) {
        try {
          if (!(await this.fileService.moveToTrash(item)))
            throw new Error(`${item.name} could not be moved to the trash.`);
        } catch (ex) {
          await this.alertDialogHelper.alert(
            "Error",
            `One or more files did not get moved to the trash. Error: ${ex}`,
            AlertDialogType.Error
          );
          break;
        }
      }
    } else if (
      permanent &&
      (await this.alertDialogHelper.confirm(
        "Delete",
        `Are you sure you want to permanently delete ${items}? This cannot be undone.`,
        "Delete",
        AlertDialogButtonType.Danger
      ))
    ) {
      for (const item of fsItems) {
        try {
          await this.fileService.delete(item);
        } catch (ex) {
          await this.alertDialogHelper.alert(
            "Error",
            `One or more files did not get deleted. Error: ${ex}`,
            AlertDialogType.Error
          );
          break;
        }
      }
    }
  }

  public async createNewFolder() {
    let newDirPath: string = system.path.join(this.tab.path, "New Folder");

    while (this.fileService.pathExists(newDirPath)) {
      const split = newDirPath.split(" ");
      const numStr = split.slice(-1)[0];
      const num = Number(numStr);

      if (isNaN(num)) {
        newDirPath = split.join(" ") + " 2";
      } else {
        newDirPath = split.slice(0, -1).join(" ") + " " + (num + 1);
      }
    }

    try {
      await system.fs.mkdir(newDirPath);
    } catch (ex) {
      await this.alertDialogHelper.alert(
        "New Folder Error",
        `Could not create new directory.\n${ex}`,
        AlertDialogType.Error
      );
    }
  }

  public async showSelectedItemProperties() {
    await ItemProperties.openAsDialog(
      this.dialogService,
      this.fsItems.selected.length > 0 ? this.fsItems.selected : [this.tab.directory]
    );
  }

  private navigateGrid(direction: "up" | "down" | "right" | "left", ev: KeyboardEvent) {
    if (!ev.ctrlKey && !ev.shiftKey) this.fsItems.unselectAll();

    UiUtil.navigateGrid(this.itemList, ".draggable.selected", direction, (nextItemIndex) => {
      const item = this.fsItems.view[nextItemIndex];
      if (!ev.ctrlKey) {
        this.fsItems.select(item);
      } else {
        if (item.isSelected) this.fsItems.unselect(item);
        else this.fsItems.select(item);
      }
    });
  }

  private bindKeyboardEvents() {
    const keyHandler = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && !ev.altKey) {
        if (ev.code === KeyCode.KeyA) {
          this.fsItems.selectAll();
          ev.preventDefault();
        } else if (ev.code === KeyCode.KeyC) {
          this.copySelectedItems();
        } else if (ev.code === KeyCode.KeyX) {
          this.cutSelectedItems();
        } else if (ev.code === KeyCode.KeyV) {
          this.pasteItems();
        }
      } else if (!ev.ctrlKey && !ev.altKey) {
        if (ev.code === KeyCode.ArrowRight) {
          this.navigateGrid("right", ev);
        } else if (ev.code === KeyCode.ArrowLeft) {
          this.navigateGrid("left", ev);
        } else if (ev.code === KeyCode.ArrowUp) {
          this.navigateGrid("up", ev);
        } else if (ev.code === KeyCode.ArrowDown) {
          this.navigateGrid("down", ev);
        } else if (ev.code === KeyCode.Enter && this.fsItems.selected.length > 0) {
          this.openSelected();
        } else if (ev.shiftKey && ev.code === KeyCode.Delete) {
          this.deleteSelected(true);
        } else if (ev.code === KeyCode.Delete) {
          this.deleteSelected(false);
        }
      }
    };

    this.element.addEventListener("keydown", keyHandler);
    this.detaches.push(() => this.element.removeEventListener("keydown", keyHandler));
  }

  private bindMouseEvents() {
    const id = `fs-view[data-id='${this.id}']`;
    const selection = new SelectionArea({
      class: "selection-area",
      container: this.element,
      selectables: [`${id} .fs-item`],
      startareas: [id, `${id} > .ui.horizontal.list`],
      boundaries: [id],
      startThreshold: 5,
    });

    this.detaches.push(() => selection.destroy());

    selection
      .on("beforestart", (ev) => {
        this.element.focus();

        const target = ev.event?.target as HTMLElement;
        const fsItemElement = UiUtil.selfOrClosestParentWithClass(target, "fs-item");
        const fsItem = this.getFsItem(fsItemElement);
        const ctrlKey = ev.event?.ctrlKey ?? false;

        // Handle right-click actions
        if (ev.event instanceof MouseEvent) {
          if (ev.event.which == 3) {
            if (fsItemElement) {
              if (!ctrlKey) {
                const itemName = fsItemElement.getAttribute("data-name")!;
                const item = this.fsItems.get(itemName);

                // If item is not already selected, unselect others and select this one
                // Otherwise the user is just right clicking on an already selected item
                if (!item.isSelected) {
                  this.fsItems.unselectAll();
                  this.fsItems.select(item);
                }
              }
            } else {
              this.fsItems.unselectAll();
            }

            const x = ev.event.clientX;
            const y = ev.event.clientY;

            this.toggleContextMenu("show", x, y);

            // Do not continue with selection
            return false;
          } else if (target.classList.contains("dropdown") === false) {
            this.toggleContextMenu("hide");
          }

          if (this.contextMenu.contains(fsItemElement)) return false;
        }

        // If clicking on a fsitem that isn't selected and without the CTRL key
        // We handle this here instead of in the start event becuase we need to handle this
        // early enough for the drag and drop mechanism to pick it up as a selected item
        if (fsItem && !fsItem.isSelected && !ctrlKey) {
          this.fsItems.unselectAll();
          this.fsItems.select(fsItem);
        }

        // If we aren't clicking a fsitem with the CTRL key and we aren't selecting a context-menu option
        // deselect all items
        if (!ctrlKey && !fsItem && !UiUtil.hasOrParentHasClass(target, "context-menu")) {
          this.fsItems.unselectAll();
        }

        return true;
      })
      .on("start", (ev) => {
        const isDrag = ev.event?.type === "mousemove";
        const ctrlKey = ev.event?.ctrlKey ?? false;
        const target = ev.event?.target as HTMLElement;
        const fsItemElement =
          UiUtil.selfOrClosestParentWithClass(target, "fs-item") ??
          UiUtil.selfOrClosestParentWithClass(target, "gu-mirror");
        const fsItem = this.getFsItem(fsItemElement);

        // Handle when a fs item is clicked
        if (fsItem) {
          if (!isDrag) {
            if (!ctrlKey) {
              this.fsItems.unselectAll();
              this.fsItems.select(fsItem);
            } else this.fsItems.inverseSelection(fsItem);
          } else {
            if (!fsItem.isSelected) {
              this.fsItems.unselectAll();
              this.fsItems.select(fsItem);
            }

            selection.cancel(false);
          }
        }
      })
      .on("move", (ev) => {
        // If ev.event is null/undefined then it is not a drag event, it is a single click event
        // We only want to handle drag/move events here
        if (!ev.event) return;

        const event = ev.event;

        ev.store.changed.added.forEach((target) => {
          const fsItem = this.getFsItem(target);
          if (fsItem) {
            if (event.ctrlKey) this.fsItems.inverseSelection(fsItem);
            else this.fsItems.select(fsItem);
          }
        });

        ev.store.changed.removed.forEach((target) => {
          const fsItem = this.getFsItem(target);
          if (fsItem) this.fsItems.unselect(fsItem);
        });
      });

    const hideContextMenuOnLostFocus = () => this.toggleContextMenu("hide");
    this.element.addEventListener("focusout", hideContextMenuOnLostFocus);
    this.detaches.push(() =>
      this.element.removeEventListener("focusout", hideContextMenuOnLostFocus)
    );
  }

  @watch((vm: FsView) => vm.tab.path)
  private async initDragAndDrop() {
    const destroyDnd = () => {
      if (this.drake) {
        this.drake.destroy();
        this.drake = undefined;
      }
    };

    this.detaches.push(() => {
      destroyDnd();
    });
    destroyDnd();

    // HACK: to wait for files to load into DOM
    await delay(1000);

    let fsItems = Array.from(document.getElementsByClassName("draggable"));
    while (fsItems.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      fsItems = Array.from(document.getElementsByClassName("draggable"));
    }

    this.drake = dragula([], {
      accepts: (el, target, source, sibling) => {
        return (
          target?.getAttribute("data-is-dir") === "true" ||
          target?.tagName === "ADDRESS-CRUMB" ||
          target?.classList.contains("sidebar-item") === true
        );
      },
      copy: true,
    });

    this.drake.containers.push(...fsItems);
    this.drake.containers.push(
      ...Array.from(document.querySelectorAll("address-bar address-crumb"))
    );
    this.drake.containers.push(...Array.from(document.querySelectorAll("sidebar .sidebar-item")));

    this.drake.on("shadow", (el, container, source) => {
      // Dragula adds the dragged items by default into the target container DOM, remove it
      container.querySelectorAll(".gu-transit").forEach((n) => n.remove());

      // Style the container we are hover over with the dragged items
      document
        .querySelectorAll(".drop-container")
        .forEach((n) => n.classList.remove("drop-container"));
      container.classList.add("drop-container");
    });

    this.drake.on("cloned", (clone, original, type) => {
      const mirrorContainer = document.getElementsByClassName("gu-mirror")[0] as HTMLElement;
      if (!mirrorContainer) return;

      Array.from(mirrorContainer.children).forEach((e) => e.remove());
      mirrorContainer.classList.remove("fs-item");
      mirrorContainer.classList.remove("selected");
      mirrorContainer.style.opacity = "1";

      const selectedItems = this.element.querySelectorAll(".fs-item.selected");

      selectedItems.forEach((item) => {
        const cloned = item.cloneNode(true) as HTMLElement;
        cloned.classList.remove("selected");
        cloned.style.position = "absolute";
        cloned.querySelector(".fs-item-name")?.remove();
        cloned.querySelector(".fs-item-info")?.remove();
        mirrorContainer.append(cloned);
      });

      if (selectedItems.length > 1) {
        const numberIndicator = document.createElement("p");
        numberIndicator.innerHTML = selectedItems.length.toString();
        numberIndicator.style.backgroundColor = "dodgerblue";
        numberIndicator.style.color = "white";
        numberIndicator.style.fontWeight = "bold";
        numberIndicator.style.padding = "1px 5px";
        numberIndicator.style.position = "absolute";
        numberIndicator.style.top = "50%";
        numberIndicator.style.left = "50%";
        numberIndicator.style.transform = "translateX(-50%) translateY(-50%)";
        mirrorContainer.append(numberIndicator);
      }
    });

    this.drake.on("drop", async (el, target, source, sibling) => {
      document
        .querySelectorAll(".drop-container")
        .forEach((n) => n.classList.remove("drop-container"));

      if (!target) return;

      const selected = [...this.fsItems.selected];

      // Items could be dropped onto a folder or on the address bar
      let droppedOnItem: FileSystemItem | null;

      // If dropped on a folder, the target will have a data-name attribute
      droppedOnItem = this.getFsItem(target);

      // If dropped on the address bar, the address crumb items were dropped onto will have data-path and data-index attributes
      if (!droppedOnItem) {
        const path = target.getAttribute("data-path");
        const index = target.getAttribute("data-path-index");
        if (path && index) {
          const pathToMoveTo = path
            .split(/[\\/]/)
            .slice(0, Number(index) + 1)
            .join("/");
          droppedOnItem = new Directory(pathToMoveTo);
        } else if (path && !index) {
          droppedOnItem = new Directory(path);
        }
      }

      if (!droppedOnItem) return;

      // If the path being dropped on matches one of the selected items, cancel.
      if (selected.find((s) => s.path == droppedOnItem?.path)) return;

      const draggedItemsNames =
        selected.length == 1 ? selected[0].name : selected.length + " items";

      let confirmed = false;

      if (this.settings.confirmOnMove) {
        confirmed = await this.alertDialogHelper.confirm(
          "Confirm Move",
          `Are you sure you want to move ${draggedItemsNames} to ${droppedOnItem.name}?`,
          "Move"
        );
      } else confirmed = true;

      if (confirmed) {
        for (const item of selected) {
          console.log("Moving from/to: ", item, droppedOnItem);
          try {
            await this.fileService.move(item, droppedOnItem as Directory);
          } catch (ex) {
            await this.alertDialogHelper.alert(
              "Move Error",
              `'${item.name}' was not moved.\n${ex}`,
              AlertDialogType.Error
            );
            break;
          }
        }
      }

      Array.from(document.getElementsByClassName("drop-container")).forEach((e) =>
        e.classList.remove("drop-container")
      );
    });
  }

  private toggleContextMenu(
    behavior: "show" | "hide",
    x: number | undefined = undefined,
    y: number | undefined = undefined
  ) {
    const currentlyShowing = this.contextMenu.classList.contains("visible");

    if (behavior == "show" && x && y) {
      const windowWidth = Math.floor(window.innerWidth);
      const menuWidth = this.contextMenu.clientWidth;
      const menuRightX = x + menuWidth;

      // If context menu will be right of the right edge of window, show context menu on left of mouse
      if (menuRightX > windowWidth) this.contextMenu.style.left = x - menuWidth + "px";
      else this.contextMenu.style.left = x + "px";

      const windowHeight = Math.floor(window.innerHeight);
      const menuHeight = this.contextMenu.clientHeight;
      const menuBottomY = y + menuHeight;

      // If context menu will be below the bottom edge of window, show context menu on top of mouse
      if (menuBottomY > windowHeight) this.contextMenu.style.top = y - menuHeight + "px";
      else this.contextMenu.style.top = y + "px";

      this.contextMenu.classList.add("visible");
    } else if (behavior == "hide" && currentlyShowing) this.contextMenu.classList.remove("visible");
  }

  private getFsItem(element: Element | HTMLElement | undefined | null): FileSystemItem | null {
    if (!element) return null;

    const itemName = element.getAttribute("data-name");
    if (!itemName) return null;

    return this.fsItems.get(itemName);
  }
}
