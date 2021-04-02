import { bindable, ILogger, watch } from "aurelia";
import { Directory, File, FileService, FileSystemItem, FileType, KeyCode, Settings, system, UiUtil, Util } from "../../../core";
import * as chokidar from "chokidar";
import { TabInfo } from "../tabs/tab-info";
import SelectionArea from "@simonwep/selection-js";
import { FsItems } from "../tabs/fs-items";
import { PaneInfo } from "../pane-info";

export class FolderView {

    public id: string;

    @bindable public tab!: TabInfo;
    @bindable public pane!: PaneInfo;
    @bindable public fsItems!: FsItems;
    public itemsToView: FileSystemItem[] = [];

    private contextMenu!: HTMLElement;
    private detaches: (() => void)[] = [];

    //private dirWatcher: FSWatcher;

    constructor(
        private fileService: FileService,
        private readonly settings: Settings,
        private readonly element: HTMLElement,
        @ILogger private readonly logger: ILogger) {
        this.id = Util.newGuid();
    }

    public attached() {
        this.pathChanged();
        this.bindMouseEvents();
        this.bindKeyboardEvents();
    }

    public detaching() {
        this.detaches.forEach(f => f());
    }

    @watch((fv: FolderView) => fv.tab.path)
    public async pathChanged() {
        //chokidar.watch('');
        let fsItems = await this.fileService.list(this.tab.path);
        this.fsItems.clear();
        this.fsItems.addOrSetRange(...fsItems.filter(f => !f.isHidden).map(f => {
            return {
                key: f.name,
                value: f
            };
        }));

        // HACK: temporary, for rendering performance of large lists of files
        const firstLoadCount = 50;
        this.itemsToView = this.fsItems.values.length > firstLoadCount ? this.fsItems.values.slice(0, firstLoadCount) : this.fsItems.values;
        setTimeout(() => {
            this.itemsToView.push(...this.fsItems.values.slice(firstLoadCount));
        }, 10);
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

    public deleteSelected() {
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
                this.itemsToView = this.fsItems.values;
            }
        }
    }

    private navigateGrid(direction: "up" | "down" | "right" | "left") {
        let grid = this.element.querySelector("folder-view > .list")!;
        UiUtil.navigateGrid(grid, "selected", direction, nextItemIndex => {
            this.fsItems.unselectAll();
            this.fsItems.select(this.fsItems.values[nextItemIndex]);
        });
    }

    private bindKeyboardEvents() {
        let keyHandler = (ev: KeyboardEvent) => {
            if (ev.ctrlKey) {
                if (ev.code == KeyCode.KeyA) {
                    this.fsItems.selectAll();
                }
            }
            else {
                if (ev.code == KeyCode.ArrowRight) {
                    this.navigateGrid("right");
                }
                else if (ev.code == KeyCode.ArrowLeft) {
                    this.navigateGrid("left");
                }
                else if (ev.code == KeyCode.ArrowUp) {
                    this.navigateGrid("up");
                }
                else if (ev.code == KeyCode.ArrowDown) {
                    this.navigateGrid("down");
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
        const id = `folder-view[data-id='${this.id}']`;
        const selection = new SelectionArea({
            class: 'selection-area',
            container: this.element,
            selectables: [`${id} fs-item`],
            startareas: [id, `${id} > .ui.horizontal.list`],
            boundaries: [id],
            startThreshold: 5
        });

        this.detaches.push(() => selection.destroy());

        selection.on('beforestart', ev => {

            this.logger.info('beforestart', ev);

            const target = ev.event?.target as Element;
            const targetIsFsItem = target.tagName === "FS-ITEM";

            // Handle right-click actions
            if (ev.event instanceof MouseEvent) {
                if (ev.event.which == 3) {
                    if (targetIsFsItem) {
                        if (!ev.event.ctrlKey) {
                            const itemName = target.getAttribute("data-name")!;
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

                if (this.contextMenu.contains(target))
                    return false;
            }

            // When clicking on something other than an <fs-item> and CTRL key is not held, clear all selection
            if (!ev.event?.ctrlKey && !targetIsFsItem) {
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

            this.contextMenu.style.left = x + "px";

            let windowHeight = Math.floor(window.innerHeight);
            let menuHeight = this.contextMenu.clientHeight;
            let menuBottomY = y + menuHeight;

            // If context menu will be below the bottom edge of window, show context menu on top of mouse
            if (menuBottomY > windowHeight) {
                this.contextMenu.style.top = (y - menuHeight) + "px";
            }
            else {
                this.contextMenu.style.top = y + "px";
            }
            this.contextMenu.classList.add('visible');
        }
        else if (behavior == "hide" && currentlyShowing)
            this.contextMenu.classList.remove('visible');
    }
}