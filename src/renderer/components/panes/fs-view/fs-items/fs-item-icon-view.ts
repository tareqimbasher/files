import { bindable } from "aurelia";
import { Directory, FileSystemItem } from "@domain";
import { FsItemView } from "./fs-item-view";
import { FileSizeValueConverter } from "application/value-converters";

export class FSItemIconView extends FsItemView {
  @bindable() override item!: FileSystemItem;

  public get title() {
    if (!this.item) return "";

    let title = "";

    if (this.item instanceof Directory) {
      title = `Contents: ${this.item.itemCount} items`;
      if (this.item.directoriesCount > 0) title += `\nFolders: ${this.item.directoriesCount}`;
      if (this.item.filesCount > 0)
        title += `\nFiles: ${this.item.filesCount} (${FileSizeValueConverter.toFormattedString(
          this.item.filesTotalSize
        )})`;
    } else {
      title = `Size: ${FileSizeValueConverter.toFormattedString(this.item.size)}`;
    }

    title += `\nCreated: ${this.item.dateCreated.toLocaleString()}`;
    title += `\nModified: ${this.item.dateModified.toLocaleString()}`;

    return title;
  }
}
