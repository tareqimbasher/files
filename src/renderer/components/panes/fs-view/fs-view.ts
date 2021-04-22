import { bindable, ILogger } from "aurelia";
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
        //this.bindMouseEvents();
        this.bindKeyboardEvents();

        setTimeout(() => {
            const fsItems = Array.from(document.getElementsByClassName("draggable"));
            const folders = fsItems.filter(e => e.getAttribute("data-dir") === "true");

            console.log(fsItems);
            const drake = dragula([], {
                //isContainer: el => {
                //    //const r = UiUtil.hasOrParentHasClass(el as HTMLElement, "fs-item") && el?.getAttribute("data-dir") === "true";
                //    //console.log("isContainer", r, el);
                //    return false;
                //},
                //isContainer: el => {
                //    const r = UiUtil.closestParentWithClass(el as HTMLElement, "fs-item");
                //    console.log("isContainer", !!r);
                //    return !r;
                //},
                //isContainer: el => {
                //    const r = el?.tagName === "FS-ITEM-ICON-VIEW"
                //    //console.log("isContainer", el, r);
                //    return r;
                //},
                moves: (el, source, handle, sibling) => {
                    //const r = UiUtil.hasOrParentHasClass(el as HTMLElement, "fs-item");
                    //console.log("moves", r, el);
                    //return r;
                    return true;
                },
                accepts: (el, target, source, sibling) => {
                    return target?.getAttribute("data-is-dir") === "true";
                },
                copy: true
            });

            drake.containers.push(...fsItems);
            //drake.containers.push(this.itemList);

            //drake.on("over", (el, container, source) => {
            //    console.log("over el", el);
            //    console.log("over container", container);
            //    console.log("over source", source);
            //});

            drake.on("shadow", (el, container, source) => {
                //console.log("shadow el", el);
                //console.log("shadow container", container);
                //console.log("shadow source", source);
                //container.querySelectorAll(".gu-transit").forEach(n => n.remove());
                Array.from(container.children).forEach(c => {
                    if (c.classList.contains("gu-transit"))
                        c.remove();
                });

                Array.from(document.getElementsByClassName("drop-container"))
                    .forEach(e => e.classList.remove("drop-container"));
                container.classList.add("drop-container");
                (el as HTMLElement).style.backgroundColor = "red";
                (el as HTMLElement).style.color = "red";
                console.log(el);
            });

            drake.on("drop", async (el, target, source, sibling) => {
                //console.log("drop el", el);
                //console.log("drop target", target);
                //console.log("drop source", source);
                //console.log("drop sibling", sibling);

                if (!target) return;

                const draggedItemName = source.getAttribute("data-name");
                if (!draggedItemName) return;
                const draggedItem = this.fsItems.get(draggedItemName);

                const droppedOnItemName = target.getAttribute("data-name");
                if (!droppedOnItemName) return;
                const droppedOnItem = this.fsItems.get(droppedOnItemName);

                const confirmed = this.settings.confirmOnMove
                    ? await confirm(`Are you sure you want to move ${draggedItem.name} to ${droppedOnItem.name}?\n\n`
                        + `From: ${draggedItem.path}\nTo: ${droppedOnItem.path}`)
                    : true;

                if (confirmed) {

                    console.log("Moving from/to: ", draggedItem, droppedOnItem);
                    this.fileService.move(draggedItem, droppedOnItem as Directory);
                    this.fsItems.remove(draggedItem.name);
                }

                Array.from(document.getElementsByClassName("drop-container"))
                    .forEach(e => e.classList.remove("drop-container"));
            });

        }, 1000);
    }

    public detaching() {
        this.detaches.forEach(f => f());
    }

    public openSelected() {

        let fsItems = this.fsItems.selected;

        // TODO handle multiple directories selected or mix of dir and files
        // Currently if a directory is selected we will only handle that dir
        var dir = fsItems.find(f => f instanceof Directory);
        if (dir)
            fsItems = [dir];

        for (let fsItem of fsItems) {
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
        let fsItems = this.fsItems.selected;
        if (fsItems.length == 0)
            return;

        if (confirm(`Are you sure you want to move ${fsItems.length} items to the trash?`)) {
            const removedItems = [];

            for (let item of fsItems) {
                try {
                    if (!this.fileService.moveToTrash(item.path))
                        throw new Error(`${item.name} could not be moved to the trash.`);

                    removedItems.push(item);
                } catch (ex) {
                    alert(`One or more files did not get moved to the trash. Error: ${ex}`);
                    break;
                }
            }

            for (let item of removedItems) {
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
        let keyHandler = (ev: KeyboardEvent) => {
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
            class: 'selection-area',
            container: this.element,
            selectables: [`${id} .fs-item`],
            startareas: [id, `${id} > .ui.horizontal.list`],
            boundaries: [id],
            startThreshold: 5
        });

        this.detaches.push(() => selection.destroy());

        selection.on('beforestart', ev => {

            const target = ev.event?.target as HTMLElement;
            const fsItemElement = UiUtil.closestParentWithClass(target, "fs-item");

            // Handle right-click actions
            if (ev.event instanceof MouseEvent) {
                if (ev.event.which == 3) {
                    if (fsItemElement) {
                        if (!ev.event.ctrlKey) {
                            const itemName = fsItemElement.getAttribute("data-name")!;
                            let item = this.fsItems.get(itemName);

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

                    let x = ev.event.clientX
                    let y = ev.event.clientY;

                    this.toggleContextMenu("show", x, y);

                    // Do not continue with selection
                    return false;
                }
                else
                    this.toggleContextMenu("hide");

                if (this.contextMenu.contains(fsItemElement))
                    return false;
            }

            const ifTrueDoNotUnselectAll =
                (ev.event?.ctrlKey && fsItemElement)
                || (UiUtil.hasOrParentHasClass(target, "context-menu"))

            if (!ifTrueDoNotUnselectAll) {
                this.fsItems.unselectAll();
            }

            return true;

        }).on('start', ev => {

            // When selection starts if CTRL key is not held, clear all selection
            if (!ev.event?.ctrlKey) {
                this.fsItems.unselectAll();
            }

        }).on('move', ev => {

            ev.store.changed.added.forEach(target => {
                const itemName = target.getAttribute("data-name");
                if (itemName) {
                    let item = this.fsItems.get(itemName);

                    // When ev.event is null, that means the user click-selected a single item, it is not a drag action.
                    // In this case we want to inverse the current selection of the item. If CTRL is not held the item
                    // would not be selected because we would have cleared selection in the 'start' event, and this will select the item.
                    // If CTRL is held, then this will inverse the selection of this element.
                    if (!ev.event) {
                        this.fsItems.inverseSelection(item);
                    }
                    else {
                        // The user is drag selecting
                        if (ev.event.ctrlKey)
                            this.fsItems.inverseSelection(item);
                        else
                            this.fsItems.select(item);
                    }
                }
            });

            ev.store.changed.removed.forEach(target => {
                const itemName = target.getAttribute("data-name");
                if (itemName)
                    this.fsItems.unselect(this.fsItems.get(itemName));
            });
        });
    }

    private toggleContextMenu(behavior: 'show' | 'hide', x: number | undefined = undefined, y: number | undefined = undefined) {

        let currentlyShowing = this.contextMenu.classList.contains('visible');

        if (behavior == "show" && x && y) {

            let windowWidth = Math.floor(window.innerWidth);
            let menuWidth = this.contextMenu.clientWidth;
            let menuRightX = x + menuWidth;

            // If context menu will be right of the right edge of window, show context menu on left of mouse
            if (menuRightX > windowWidth)
                this.contextMenu.style.left = (x - menuWidth) + "px";
            else
                this.contextMenu.style.left = x + "px";



            let windowHeight = Math.floor(window.innerHeight);
            let menuHeight = this.contextMenu.clientHeight;
            let menuBottomY = y + menuHeight;

            // If context menu will be below the bottom edge of window, show context menu on top of mouse
            if (menuBottomY > windowHeight)
                this.contextMenu.style.top = (y - menuHeight) + "px";
            else
                this.contextMenu.style.top = y + "px";

            this.contextMenu.classList.add('visible');
        }
        else if (behavior == "hide" && currentlyShowing)
            this.contextMenu.classList.remove('visible');
    }
}