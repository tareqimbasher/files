import { FileSystemItem, FsItems } from "../../../core";

export class TabHistoryState {

    /**
     * The single selected file system item before this state was navigated away from.
     */
    public selectedFileSystemItem: FileSystemItem | undefined;

    constructor(public path: string) {
    }

    /**
     * Remembers some information that can be restored when this history state is navigated to.
     */
    public remember(fsItems: FsItems) {
        // Remember the single seleceted fs item if applicable
        if (fsItems.selected.length == 1)
            this.selectedFileSystemItem = fsItems.selected[0];

        else
            this.selectedFileSystemItem = undefined;
    }

    /**
     * Restore remembered information.
     */
    public restore(fsItems: FsItems) {
        // Restore the single selected item if applicable
        if (this.selectedFileSystemItem) {
            const item = fsItems.view.find(i => i.name == this.selectedFileSystemItem?.name);
            if (item)
                fsItems.select(item);
        }
    }
}
