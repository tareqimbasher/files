import { bindShortcut, KeyCode } from "common";

@bindShortcut("Edit Address", KeyCode.KeyL, { ctrl: true })
export class ViewCommandEditAddressBarEvent {}
