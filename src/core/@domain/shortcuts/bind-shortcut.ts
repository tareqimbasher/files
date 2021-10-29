import { Constructable } from "aurelia";
import { Shortcut } from "./shortcut";
import { ElectronUtil, KeyCode } from "common";

/**
 * Binds a keyboard shortcut to this class. When shortcut is invoked a message
 * will be fired of the target type.
 * @param name The name of the shortcut.
 * @param keyOrExpression The key or key expression.
 * @param options Shortcut options.
 */
export function bindShortcut(
  name: string,
  keyOrExpression: KeyCode | ((keyCode: KeyCode) => boolean),
  options: Partial<{ ctrl: boolean; alt: boolean; shift: boolean; meta: boolean }>
) {
  return function (constructor: Constructable) {
    if (!ElectronUtil.executingFromRenderer()) return;

    const shortcut = new Shortcut(name)
      .withCtrlKey(options.ctrl ?? false)
      .withAltKey(options.alt ?? false)
      .withShiftKey(options.shift ?? false)
      .withMetaKey(options.meta ?? false)
      .hasAction((event, eventBus) => eventBus.publish(new constructor()));

    if (typeof keyOrExpression === "string") {
      shortcut.withKey(keyOrExpression);
    } else {
      shortcut.withKeyExpression(keyOrExpression);
    }

    shortcut.register();
  };
}
