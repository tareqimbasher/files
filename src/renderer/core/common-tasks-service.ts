import { Directory, FileService } from "core";
import {
  AlertDialogButtonType,
  AlertDialogHelper,
  AlertDialogType,
  Clipboard,
  ClipboardItemType,
} from "../components/common";
import { IDialogService } from "@aurelia/runtime-html";
import { ILogger } from "aurelia";
import { system } from "common";
import { ItemProperties } from "../components/dialogs/properties/item-properties";
import { WindowManager } from "../components";

export class CommonTasksService {
  constructor(
    private windowManager: WindowManager,
    private readonly fileService: FileService,
    private readonly clipboard: Clipboard,
    private readonly alertDialogHelper: AlertDialogHelper,
    @IDialogService private readonly dialogService: IDialogService,
    @ILogger private readonly logger: ILogger
  ) {}

  private get fsItems() {
    return this.windowManager.panes.active.tabs.active.fsItems;
  }

  private get activeTab() {
    return this.windowManager.panes.active.tabs.active;
  }

  public async openSelected(): Promise<void> {
    let fsItems = this.fsItems.selected;

    // TODO handle multiple directories selected or mix of dir and files
    // Currently if a directory is selected we will only handle that dir
    const dir = fsItems.find((f) => f instanceof Directory);
    if (dir) fsItems = [dir];

    for (const fsItem of fsItems) {
      try {
        if (fsItem instanceof Directory) {
          this.activeTab.setPath(fsItem.path);
        } else {
          system.shell.openPath(fsItem.path);
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
    else targetDirPath = this.activeTab.path;

    for (const ci of this.clipboard.items) {
      const targetPath = system.path.join(targetDirPath, ci.item.name);

      const actionVerb = ci.type === ClipboardItemType.Copy ? "copied" : "moved";

      if (await system.fs.pathExists(targetPath)) {
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
          await this.fileService.moveToTrash(item);
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
    let newDirPath: string = system.path.join(this.activeTab.path, "New Folder");

    while (await system.fs.pathExists(newDirPath)) {
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
      this.fsItems.selected.length > 0 ? this.fsItems.selected : [this.activeTab.directory]
    );
  }
}
