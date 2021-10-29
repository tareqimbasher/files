import { singleton } from "aurelia";

@singleton
export class Settings {
  public values: Map<string, unknown> = new Map<string, unknown>([
    [nameof(this.theme), "light"],
    [nameof(this.showHiddenFiles), false],
    [nameof(this.fileViewType), FileViewTypes.Icons],
    [nameof(this.confirmOnMove), true],
    [nameof(this.windowControlsPosition), "right"],
    [nameof(this.headerMinimized), false],
    [nameof(this.sideBarMinimized), false],
  ]);
  public toggleHeaderMinimized = () => (this.headerMinimized = !this.headerMinimized);
  public toggleSideBarMinimized = () => (this.sideBarMinimized = !this.sideBarMinimized);

  public get inverted(): "inverted" | "" {
    return this.theme == "light" ? "" : "inverted";
  }

  public get theme(): "light" | "dark" {
    return this.values.get(nameof(this.theme)) as "light" | "dark";
  }

  public set theme(value) {
    this.values.set(nameof(this.theme), value);
  }

  public get showHiddenFiles(): boolean {
    return this.values.get(nameof(this.showHiddenFiles)) as boolean;
  }

  public set showHiddenFiles(value: boolean) {
    this.values.set(nameof(this.showHiddenFiles), value);
  }

  public get fileViewType(): FileViewTypes {
    return this.values.get(nameof(this.fileViewType)) as FileViewTypes;
  }

  public set fileViewType(value: FileViewTypes) {
    this.values.set(nameof(this.fileViewType), value);
  }

  public get headerMinimized(): boolean {
    return this.values.get(nameof(this.headerMinimized)) as boolean;
  }

  public set headerMinimized(value) {
    this.values.set(nameof(this.headerMinimized), value);
  }

  public get sideBarMinimized(): boolean {
    return this.values.get(nameof(this.sideBarMinimized)) as boolean;
  }

  public set sideBarMinimized(value) {
    this.values.set(nameof(this.sideBarMinimized), value);
  }

  public get confirmOnMove(): boolean {
    return this.values.get(nameof(this.confirmOnMove)) as boolean;
  }

  public set confirmOnMove(value: boolean) {
    this.values.set(nameof(this.confirmOnMove), value);
  }

  public get windowControlsPosition(): "left" | "right" {
    return this.values.get(nameof(this.windowControlsPosition)) as "left" | "right";
  }

  public set windowControlsPosition(value: "left" | "right") {
    this.values.set(nameof(this.windowControlsPosition), value);
  }

  public toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
  }

  public toggleShowHiddenFiles() {
    this.showHiddenFiles = !this.showHiddenFiles;
  }

  public toggleFileViewType() {
    this.fileViewType =
      this.fileViewType == FileViewTypes.Icons ? FileViewTypes.Details : FileViewTypes.Icons;
  }
}

export enum FileViewTypes {
  Icons = "Icons",
  Details = "Details",
}
