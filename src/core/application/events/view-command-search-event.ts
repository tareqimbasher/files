import { eventShortcut, Shortcut } from "@domain";
import { KeyCode } from "common";

@eventShortcut(new Shortcut("Focus Search").withCtrlKey().withKey(KeyCode.KeyS).configurable())
export class ViewCommandSearchEvent {}
