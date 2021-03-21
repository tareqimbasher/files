import { singleton } from "aurelia";
import { PaneInfo } from "./pane-info";

@singleton()
export class PaneManager {
    public panes: PaneInfo[] = [];
}
