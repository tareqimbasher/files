import { eventShortcut, Shortcut } from "@domain";
import { KeyCode } from "common";

@eventShortcut(new Shortcut("Toggle Sidebar").withAltKey().withKey(KeyCode.KeyS).configurable())
export class ViewCommandToggleSidebar {}
