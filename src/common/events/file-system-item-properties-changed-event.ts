import { FileSystemItem } from "core";

export class FileSystemItemPropertiesChangedEvent {
  constructor(public item: FileSystemItem) {}
}
