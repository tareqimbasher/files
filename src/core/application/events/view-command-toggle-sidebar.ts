import { bindShortcut } from "@domain";
import { KeyCode } from "common";

@bindShortcut("Toggle Sidebar", KeyCode.KeyS, { alt: true })
export class ViewCommandToggleSidebar {}
