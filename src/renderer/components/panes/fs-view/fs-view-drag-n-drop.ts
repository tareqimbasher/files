import { Directory, FileService, FileSystemItem } from "@domain";
import dragula from "dragula";
import "dragula/dist/dragula.css";
import { AlertDialogHelper, AlertDialogType, Settings } from "application";
import { FsView } from "./fs-view";
import { delay } from "common";

export class FsViewDragNDrop {
  private drake?: dragula.Drake;

  constructor(
    private element: HTMLElement,
    private fsView: FsView,
    private detaches: (() => void)[],
    private settings: Settings,
    private fileService: FileService,
    private alertDialogHelper: AlertDialogHelper
  ) {}

  public async InitDragAndDrop() {
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

      const selected = [...this.fsView.fsItems.selected];

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

  private getFsItem(element: Element | HTMLElement | undefined | null): FileSystemItem | null {
    if (!element) return null;

    const itemName = element.getAttribute("data-name");
    if (!itemName) return null;

    return this.fsView.fsItems.get(itemName);
  }
}
