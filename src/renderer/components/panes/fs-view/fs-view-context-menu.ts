import { FsView } from "./fs-view";
import { CommonTasksService } from "core";

export class FsViewContextMenu {
  public model!: FsView;

  constructor(private commonTasksService: CommonTasksService) {}
}
