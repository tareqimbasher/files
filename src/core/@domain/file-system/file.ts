import { FileSystemItem } from "./file-system-item";
import { FileSystemItemType } from "./file-system-item-type";

export class File extends FileSystemItem {
  constructor(path: string) {
    super(path, FileSystemItemType.File);
  }
}
