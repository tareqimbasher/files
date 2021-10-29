import SelectionArea from "@simonwep/selection-js";
import { UiUtil } from "common";
import { FileSystemItem } from "@domain";
import { FsView } from "./fs-view";

export class FsViewMouseControls {
  constructor(
    private id: string,
    private element: HTMLElement,
    private fsView: FsView,
    private contextMenu: HTMLElement,
    private detaches: (() => void)[]
  ) {}

  public bindMouseEvents() {
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
                const item = this.getFsItem(fsItemElement);

                // If item is not already selected, unselect others and select this one
                // Otherwise the user is just right clicking on an already selected item
                if (item && !item.isSelected) {
                  this.fsView.fsItems.unselectAll();
                  this.fsView.fsItems.select(item);
                }
              }
            } else {
              this.fsView.fsItems.unselectAll();
            }

            const x = ev.event.clientX;
            const y = ev.event.clientY;

            this.toggleContextMenu("show", x, y);

            // Do not continue with selection
            return false;
          } else if (!target.classList.contains("dropdown")) {
            this.toggleContextMenu("hide");
          }

          if (this.contextMenu.contains(fsItemElement)) return false;
        }

        // If clicking on a fsitem that isn't selected and without the CTRL key
        // We handle this here instead of in the start event becuase we need to handle this
        // early enough for the drag and drop mechanism to pick it up as a selected item
        if (fsItem && !fsItem.isSelected && !ctrlKey) {
          this.fsView.fsItems.unselectAll();
          this.fsView.fsItems.select(fsItem);
        }

        // If we aren't clicking a fsitem with the CTRL key and we aren't selecting a context-menu option
        // deselect all items
        if (!ctrlKey && !fsItem && !UiUtil.hasOrParentHasClass(target, "context-menu")) {
          this.fsView.fsItems.unselectAll();
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
              this.fsView.fsItems.unselectAll();
              this.fsView.fsItems.select(fsItem);
            } else this.fsView.fsItems.inverseSelection(fsItem);
          } else {
            if (!fsItem.isSelected) {
              this.fsView.fsItems.unselectAll();
              this.fsView.fsItems.select(fsItem);
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
            if (event.ctrlKey) this.fsView.fsItems.inverseSelection(fsItem);
            else this.fsView.fsItems.select(fsItem);
          }
        });

        ev.store.changed.removed.forEach((target) => {
          const fsItem = this.getFsItem(target);
          if (fsItem) this.fsView.fsItems.unselect(fsItem);
        });
      });

    const hideContextMenuOnLostFocus = () => this.toggleContextMenu("hide");
    this.element.addEventListener("focusout", hideContextMenuOnLostFocus);
    this.detaches.push(() =>
      this.element.removeEventListener("focusout", hideContextMenuOnLostFocus)
    );
  }

  private getFsItem(element: Element | HTMLElement | undefined | null): FileSystemItem | null {
    if (!element) return null;

    const itemName = element.getAttribute("data-name");
    if (!itemName) return null;

    return this.fsView.fsItems.get(itemName);
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
}
