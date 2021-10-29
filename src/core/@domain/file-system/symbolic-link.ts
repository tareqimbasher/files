import { FileSystemItem } from "./file-system-item";
import { FileSystemItemType } from "./file-system-item-type";

export class SymbolicLink extends FileSystemItem {
  constructor(path: string) {
    super(path, FileSystemItemType.SymbolicLink);
  }
}
