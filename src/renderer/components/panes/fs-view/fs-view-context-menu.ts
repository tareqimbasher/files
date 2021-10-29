import { FsView } from "./fs-view";
import { CommonTasksService } from "../../../services";

export class FsViewContextMenu {
  public model!: FsView;

  constructor(private commonTasksService: CommonTasksService) {}
}
