import { eventShortcut, Shortcut } from "@domain";
import { KeyCode } from "common";

@eventShortcut(new Shortcut("Edit Address").withCtrlKey().withKey(KeyCode.KeyL).configurable())
export class ViewCommandEditAddressBarEvent {}
