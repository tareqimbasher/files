import { FileSystemItem } from '../file-system/file-system-item';

export class FileSystemItemPropertiesChangedEvent {
  constructor(public item: FileSystemItem) {
  }
}