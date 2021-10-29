import { bindShortcut } from "@domain";
import { KeyCode } from "common";

@bindShortcut("Edit Address", KeyCode.KeyL, { ctrl: true })
export class ViewCommandEditAddressBarEvent {}
