import { IDisposable } from "aurelia";
import { KeyCode, UiUtil } from "../../../core";
import { WindowManager } from "../../window-manager";

export class FsItemNavigation implements IDisposable {
  private readonly disposables: (() => void)[] = [];

  constructor(private elementToHandleKeysOn: HTMLElement, private windowManager: WindowManager) {}

  public setup() {
    const handler = (ev: KeyboardEvent) => {
      if (ev.code === KeyCode.ArrowRight) {
        this.navigateGrid("right", ev);
      } else if (ev.code === KeyCode.ArrowLeft) {
        this.navigateGrid("left", ev);
      } else if (ev.code === KeyCode.ArrowUp) {
        ev.preventDefault(); // To disable browser default view scrolling
        this.navigateGrid("up", ev);
      } else if (ev.code === KeyCode.ArrowDown) {
        ev.preventDefault(); // To disable browser default view scrolling
        this.navigateGrid("down", ev);
      }
    };

    this.elementToHandleKeysOn.addEventListener("keydown", handler);
    this.disposables.push(() => this.elementToHandleKeysOn.removeEventListener("keydown", handler));
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable();
    }
  }

  private navigateGrid(direction: "up" | "down" | "right" | "left", ev: KeyboardEvent) {
    const activeTab = this.windowManager.panes.active.tabs.active;
    const fsItems = activeTab.fsItems;

    if (!ev.ctrlKey && !ev.shiftKey) fsItems.unselectAll();

    const gridElement = this.elementToHandleKeysOn.querySelector(
      `pane-view.active fs-view.active .fs-item-grid`
    ) as HTMLElement;

    UiUtil.navigateGrid(
      gridElement,
      ".draggable.selected",
      direction,
      (nextItemIndex: number, nextItemElement: HTMLElement) => {
        const item = fsItems.view[nextItemIndex];
        if (!ev.ctrlKey) {
          fsItems.select(item);
        } else {
          if (item.isSelected) fsItems.unselect(item);
          else fsItems.select(item);
        }

        const viewRect = gridElement.getBoundingClientRect();
        const nextRect = nextItemElement.getBoundingClientRect();
        if (nextRect.bottom > viewRect.bottom) {
          console.warn(
            `Item is below viewport, scrolling down a bit. Element bottom: ${nextRect.bottom}. View bottom: ${viewRect.bottom}`
          );
          nextItemElement.scrollIntoView({ block: "end" });
        } else if (nextRect.top < viewRect.top) {
          console.warn(
            `Item is above viewport, scrolling up a bit. Element top: ${nextRect.top}. View top: ${viewRect.top}`
          );
          nextItemElement.scrollIntoView({ block: "start" });
        }
      }
    );
  }
}
