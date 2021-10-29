import { Stats } from "fs";
import * as pathUtil from "path";
import { FileSystemItemType } from "./file-system-item-type";

export abstract class FileSystemItem {
  public path: string;
  public type: FileSystemItemType;
  public isDir: boolean;

  public size = 0;
  public dateModified!: Date;
  public dateCreated!: Date;
  public dateAccessed!: Date;
  public isSelected = false;
  public isHidden = false;
  public isSystem = false;

  constructor(path: string, type: FileSystemItemType) {
    this.path = path;
    this.type = type;
    this.isDir = type == FileSystemItemType.Directory;
  }

  public get name() {
    return pathUtil.basename(this.path);
  }

  public get extension() {
    return pathUtil.extname(this.path)?.toLowerCase();
  }

  public get directoryPath() {
    return pathUtil.dirname(this.path);
  }

  public get typeDescription() {
    if (this.type == FileSystemItemType.Directory) return "Folder";
    else if (this.type == FileSystemItemType.File) {
      // Handle files like .gitconfig
      if (!this.extension && this.name.startsWith("."))
        return this.name.replace(".", "").toUpperCase() + " File";
      else if (!this.extension) return "File";

      const ext = this.extension.replace(".", "");

      switch (ext) {
        //case "txt": return "Text Document";
        //case "pdf": return "PDF Document";
        //case "doc":
        //case "docx":
        //    return "Word Document";
        //case "xls":
        //case "xlsx":
        //    return "Excel Document";
        //case "ppt":
        //case "pptx":
        //    return "PowerPoint Document";
        default:
          return ext.toUpperCase();
      }
    } else if (this.type == FileSystemItemType.SymbolicLink) {
      return "Shortcut";
    } else {
      return "Unknown";
    }
  }

  //public setInfo(info: {
  //    size?: number,
  //    dateModified?: Date,
  //    dateCreated?: Date,
  //    dateAccessed?: Date
  //}) {
  //    if (info.size || info.size == 0) this.size = info.size;
  //    if (info.dateModified) this.dateModified = info.dateModified;
  //    if (info.dateCreated) this.dateCreated = info.dateCreated;
  //    if (info.dateAccessed) this.dateAccessed = info.dateAccessed;
  //}

  public updateInfo(stats: Stats) {
    if (this.type == FileSystemItemType.Directory) this.size = -1;
    else if (!stats.size) this.size = 0;
    else this.size = stats.size;

    if (stats.mtime) this.dateModified = stats.mtime;
    if (stats.atime) this.dateAccessed = stats.atime;
    if (stats.birthtime) this.dateCreated = stats.birthtime;
  }
}
