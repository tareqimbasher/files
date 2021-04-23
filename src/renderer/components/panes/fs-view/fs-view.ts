import { bindable, ILogger, watch } from "aurelia";
import { Tab } from "../tabs/tab";
import SelectionArea from "@simonwep/selection-js";
import {
    Directory, FileService, FileSystemItem, FsItems, KeyCode, Settings, system, UiUtil, Util
} from "../../../core";
import dragula from "dragula";
import "dragula/dist/dragula.css";
import { access } from "fs";

export class FsView {

    public id: string;

    @bindable public tab!: Tab;
    @bindable public fsItems!: FsItems;

    private itemList!: HTMLElement;
    private contextMenu!: HTMLElement;
    private detaches: (() => void)[] = [];

    constructor(
        private readonly fileService: FileService,
        private readonly settings: Settings,
        private readonly element: HTMLElement,
        @ILogger private readonly logger: ILogger) {
        this.id = Util.newGuid();
    }

    public attached() {
        this.bindMouseEvents();
        this.bindKeyboardEvents();
        this.initDragAndDrop();
    }

    public drake!: dragula.Drake;

    @watch((vm: FsView) => vm.tab.path)
    private initDragAndDrop() {
        if (this.drake) {
            this.drake.destroy();
        }

        setTimeout(() => {
            const fsItems = Array.from(document.getElementsByClassName("draggable"));

            this.drake = dragula([], {
                accepts: (el, target, source, sibling) => {
                    return target?.getAttribute("data-is-dir") === "true" || target?.tagName === "ADDRESS-CRUMB";
                },
                copy: true
            });

            this.drake.containers.push(...fsItems);
            this.drake.containers.push(...Array.from(document.querySelectorAll("address-bar address-crumb")));

            //drake.on("over", (el, container, source) => {
            //    console.log("over el", el);
            //    console.log("over container", container);
            //    console.log("over source", source);
            //});

            // DnD multiple items
            // https://jsfiddle.net/jw5e4c3c/9/

            this.drake.on("shadow", (el, container, source) => {

                //container.querySelectorAll(".gu-transit").forEach(n => n.remove());
                Array.from(container.children).forEach(c => {
                    if (c.classList.contains("gu-transit"))
                        c.remove();
                });

                document.querySelectorAll(".drop-container").forEach(n => n.classList.remove("drop-container"))

                container.classList.add("drop-container");
            });

            this.drake.on("cloned", (clone, original, type) => {
                //console.log("cloned", clone);

                const mirrorContainer = document.getElementsByClassName("gu-mirror")[0] as HTMLElement;
                //console.log("mirrorContainer", mirrorContainer);
                if (!mirrorContainer) return;

                mirrorContainer.classList.remove("fs-item");
                mirrorContainer.classList.remove("selected");
                mirrorContainer.style.opacity = "1";

                const selectedItems = this.element.querySelectorAll(".fs-item.selected");
                //console.log("selectedItems", selectedItems);

                Array.from(mirrorContainer.children).forEach(e => e.remove());

                selectedItems.forEach(item => {
                    const cloned = item.cloneNode(true) as HTMLElement;
                    cloned.classList.remove("selected");
                    cloned.style.position = "absolute";
                    cloned.querySelector(".fs-item-name")?.remove()
                    cloned.querySelector(".fs-item-info")?.remove()
                    mirrorContainer.append(cloned);
                });

                if (selectedItems.length > 1) {
                    const numberIndicator = document.createElement("p")
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
                //console.log("drop", el, target);

                document.querySelectorAll(".drop-container").forEach(n => n.classList.remove("drop-container"))

                if (!target) return;

                const selected = [...this.fsItems.selected];
                const itemsToMoveNames = selected.length == 1
                    ? selected[0].name
                    : (selected.length + " items");

                let droppedOnItem: FileSystemItem;
                const droppedOnItemName = target.getAttribute("data-name");
                if (droppedOnItemName) {
                    droppedOnItem = this.fsItems.get(droppedOnItemName);
                }
                else {
                    const path = target.getAttribute("data-path");
                    const index = target.getAttribute("data-path-index");
                    if (path && index) {
                        const pathToMoveTo = path.split(/[\\\/]/).slice(0, Number(index) + 1).join("/");
                        console.log("pathToMoveTo", pathToMoveTo);
                        droppedOnItem = new Directory(pathToMoveTo);
                    }
                    else {
                        return;
                    }
                }

                // If path being dropped on matches one of the selected items, cancel.
                if (selected.find(s => s.path == droppedOnItem.path))
                    return;

                const confirmed = this.settings.confirmOnMove
                    ? await confirm(`Are you sure you want to move ${itemsToMoveNames} to ${droppedOnItem.name}?`)
                    : true;

                if (confirmed) {
                    for (let item of selected) {
                        console.log("Moving from/to: ", item, droppedOnItem);
                        this.fileService.move(item, droppedOnItem as Directory);
                        this.fsItems.remove(item.name);
                    }
                }

                Array.from(document.getElementsByClassName("drop-container"))
                    .forEach(e => e.classList.remove("drop-container"));
            });

        }, 1500);
    }

    public detaching() {
        this.detaches.forEach(f => f());
    }

    public openSelected() {

        let fsItems = this.fsItems.selected;

        // TODO handle multiple directories selected or mix of dir and files
        // Currently if a directory is selected we will only handle that dir
        const dir = fsItems.find(f => f instanceof Directory);
        if (dir)
            fsItems = [dir];

        for (const fsItem of fsItems) {
            try {
                if (fsItem instanceof Directory) {
                    this.tab.setPath(fsItem.path);
                }
                else {
                    system.shell.openExternal(fsItem.path);
                }
            }
            catch (ex) {
                this.logger.error(ex);
            }
        }
    }

    public async deleteSelected() {
        const fsItems = this.fsItems.selected;
        if (fsItems.length == 0)
            return;

        if (confirm(`Are you sure you want to move ${fsItems.length} items to the trash?`)) {
            const removedItems = [];

            for (const item of fsItems) {
                try {
                    if (!this.fileService.moveToTrash(item.path))
                        throw new Error(`${item.name} could not be moved to the trash.`);

                    removedItems.push(item);
                } catch (ex) {
                    alert(`One or more files did not get moved to the trash. Error: ${ex}`);
                    break;
                }
            }

            for (const item of removedItems) {
                this.fsItems.remove(item.name);
            }
        }
    }

    private navigateGrid(direction: "up" | "down" | "right" | "left", ev: KeyboardEvent) {

        if (!ev.ctrlKey && !ev.shiftKey)
            this.fsItems.unselectAll();

        UiUtil.navigateGrid(this.itemList, "selected", direction, nextItemIndex => {
            console.log(nextItemIndex);
            const item = this.fsItems.view[nextItemIndex];
            if (!ev.ctrlKey) {
                this.fsItems.select(item);
            }
            else {
                if (item.isSelected)
                    this.fsItems.unselect(item);
                else
                    this.fsItems.select(item);
            }
        });
    }

    private bindKeyboardEvents() {
        const keyHandler = (ev: KeyboardEvent) => {
            if (!ev.altKey) {
                if (ev.code == KeyCode.KeyA) {
                    this.fsItems.selectAll();
                    ev.preventDefault();
                }
                else if (ev.code == KeyCode.ArrowRight) {
                    this.navigateGrid("right", ev);
                }
                else if (ev.code == KeyCode.ArrowLeft) {
                    this.navigateGrid("left", ev);
                }
                else if (ev.code == KeyCode.ArrowUp) {
                    this.navigateGrid("up", ev);
                }
                else if (ev.code == KeyCode.ArrowDown) {
                    this.navigateGrid("down", ev);
                }
                else if (ev.code == KeyCode.Enter && this.fsItems.selected.length > 0) {
                    this.openSelected();
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
            startThreshold: 5
        });

        this.detaches.push(() => selection.destroy());

        selection.on("beforestart", ev => {
            console.log("beforestart");

            const target = ev.event?.target as HTMLElement;
            const fsItemElement = UiUtil.selfOrClosestParentWithClass(target, "fs-item");

            // Handle right-click actions
            if (ev.event instanceof MouseEvent) {
                if (ev.event.which == 3) {
                    if (fsItemElement) {
                        if (!ev.event.ctrlKey) {
                            const itemName = fsItemElement.getAttribute("data-name")!;
                            const item = this.fsItems.get(itemName);

                            // If item is not already selected, unselect others and select this one
                            // Otherwise the user is just right clicking on an already selected item
                            if (!item.isSelected) {
                                this.fsItems.unselectAll();
                                this.fsItems.select(item);
                            }
                        }
                    }
                    else {
                        this.fsItems.unselectAll();
                    }

                    const x = ev.event.clientX
                    const y = ev.event.clientY;

                    this.toggleContextMenu("show", x, y);

                    // Do not continue with selection
                    return false;
                }
                else
                    this.toggleContextMenu("hide");

                if (this.contextMenu.contains(fsItemElement))
                    return false;
            }

            // Handle when to unselect all selected items
            if (!ev.event?.ctrlKey && !fsItemElement && !UiUtil.hasOrParentHasClass(target, "context-menu")) {
                this.fsItems.unselectAll();
            }

            return true;

        }).on("start", ev => {

            const isDrag = ev.event?.type === "mousemove";
            console.log("start", ev);

            const target = ev.event?.target as HTMLElement;
            const fsItemElement = UiUtil.selfOrClosestParentWithClass(target, "fs-item")
                ?? UiUtil.selfOrClosestParentWithClass(target, "gu-mirror");

            // Handle when a fs item is clicked
            if (fsItemElement) {
                if (!isDrag) {
                    if (!ev.event?.ctrlKey)
                        this.fsItems.unselectAll();

                    const itemName = fsItemElement.getAttribute("data-name");
                    if (itemName) {
                        const item = this.fsItems.get(itemName);

                        if (ev.event?.ctrlKey)
                            this.fsItems.inverseSelection(item);
                        else
                            this.fsItems.select(item);
                    }
                }
                else {
                    console.log("Cancelling");
                    selection.cancel(false);
                }
            }

        }).on("move", ev => {

            // If ev.event is null/undefined then it is not a drag event, it is a single click event
            // We only want to handle drag/move events here
            if (!ev.event)
                return;

            const event = ev.event;

            ev.store.changed.added.forEach(target => {
                const itemName = target.getAttribute("data-name");
                if (itemName) {
                    const item = this.fsItems.get(itemName);

                    // The user is drag selecting
                    if (event.ctrlKey)
                        this.fsItems.inverseSelection(item);
                    else
                        this.fsItems.select(item);
                }
            });

            ev.store.changed.removed.forEach(target => {
                const itemName = target.getAttribute("data-name");
                if (itemName)
                    this.fsItems.unselect(this.fsItems.get(itemName));
            });
        });
    }

    private toggleContextMenu(behavior: "show" | "hide", x: number | undefined = undefined, y: number | undefined = undefined) {

        const currentlyShowing = this.contextMenu.classList.contains("visible");

        if (behavior == "show" && x && y) {

            const windowWidth = Math.floor(window.innerWidth);
            const menuWidth = this.contextMenu.clientWidth;
            const menuRightX = x + menuWidth;

            // If context menu will be right of the right edge of window, show context menu on left of mouse
            if (menuRightX > windowWidth)
                this.contextMenu.style.left = (x - menuWidth) + "px";
            else
                this.contextMenu.style.left = x + "px";



            const windowHeight = Math.floor(window.innerHeight);
            const menuHeight = this.contextMenu.clientHeight;
            const menuBottomY = y + menuHeight;

            // If context menu will be below the bottom edge of window, show context menu on top of mouse
            if (menuBottomY > windowHeight)
                this.contextMenu.style.top = (y - menuHeight) + "px";
            else
                this.contextMenu.style.top = y + "px";

            this.contextMenu.classList.add("visible");
        }
        else if (behavior == "hide" && currentlyShowing)
            this.contextMenu.classList.remove("visible");
    }
}