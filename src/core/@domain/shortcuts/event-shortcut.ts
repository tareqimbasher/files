import { Constructable } from "aurelia";
import { Shortcut } from "./shortcut";
import { ElectronUtil } from "common";

/**
 * Binds a keyboard shortcut to this type. When the shortcut is invoked an event
 *  message of this type will be emitted.
 * @param shortcut Shortcut object.
 */
export function eventShortcut(shortcut: Omit<Shortcut, "register">) {
  return function (constructor: Constructable) {
    if (!ElectronUtil.executingFromRenderer()) return;

    shortcut.hasAction((event, eventBus) => eventBus.publish(new constructor()));

    (shortcut as Shortcut).register();
  };
}
