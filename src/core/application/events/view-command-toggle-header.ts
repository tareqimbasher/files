import { eventShortcut, Shortcut } from "@domain";
import { KeyCode } from "common";

@eventShortcut(new Shortcut("Toggle Header").withAltKey().withKey(KeyCode.KeyH).configurable())
export class ViewCommandToggleHeader {}
