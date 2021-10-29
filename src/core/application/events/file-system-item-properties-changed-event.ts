import { FileSystemItem } from "@domain";

export class FileSystemItemPropertiesChangedEvent {
  constructor(public item: FileSystemItem) {}
}
