import { Constructable } from "aurelia";
import { ModifierKeys } from "common";

//Partial<{ ctrl: boolean; alt: boolean; shift: boolean; meta: boolean }>
export function hasShortcut(key: string, ...modifiers: ModifierKeys[]) {
  return function (constructor: Constructable) {
    console.warn(new constructor());
  };
}

//@hasShortcut(KeyCode.KeyL, ModifierKeys.Control)
export class ViewCommandEditAddressBarEvent {}
