import { Settings } from "core";
import { KeyboardShortcuts } from "../../renderer/components/dialogs/keyboard-shortcuts/keyboard-shortcuts";
import { WindowManager } from "../../renderer/components";
import { IEventAggregator } from "aurelia";
import { IDialogService } from "@aurelia/runtime-html";
import { Shortcut } from "./shortcut";
import { KeyCode, KeyCodeUtil } from "common";

/**
 * Manages shortcuts.
 */
export class ShortcutManager {
  private static registry: Shortcut[] = [];

  constructor(
    private windowManager: WindowManager,
    private settings: Settings,
    @IEventAggregator private readonly eventBus: IEventAggregator,
    @IDialogService private readonly dialogService: IDialogService
  ) {}

  public static registerShortcut(shortcut: Shortcut) {
    const existing = this.registry.findIndex((s) => s.matches(shortcut));
    if (existing >= 0) {
      this.registry[existing] = shortcut;
    } else {
      this.registry.push(shortcut);
    }
  }

  public setupKeyboardShortcuts() {
    this.setupApplicationWideKeyboardShortcuts();

    document.addEventListener("keydown", (ev) => {
      const shortcut = ShortcutManager.registry.find((s) => s.matches(ev));
      if (!shortcut) return;

      shortcut.action(ev, this.eventBus);
    });
  }

  private setupApplicationWideKeyboardShortcuts() {
    const panes = this.windowManager.panes;

    new Shortcut("New Tab")
      .withKey(KeyCode.KeyT)
      .withCtrlKey()
      .hasAction(() => panes.active.tabs.add().activate())
      .register();

    new Shortcut("Close Current Tab")
      .withKey(KeyCode.KeyW)
      .withCtrlKey()
      .hasAction((event) => {
        panes.active.tabs.active.close();
        event.preventDefault();
      })
      .register();

    new Shortcut("Go to Left Tab")
      .withKey(KeyCode.ArrowLeft)
      .withCtrlKey()
      .hasAction(() => {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum - 1);
      })
      .register();

    new Shortcut("Go to Right Tab")
      .withKey(KeyCode.ArrowRight)
      .withCtrlKey()
      .hasAction(() => {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum + 1);
      })
      .register();

    new Shortcut("Go to Tab")
      .withKeyExpression((keyCode) => KeyCodeUtil.isDigit(keyCode))
      .withCtrlKey()
      .hasAction((event) => {
        const digit = KeyCodeUtil.parseDigit(event.code);
        if (digit > 0) this.setActiveTab(digit);
      })
      .register();

    new Shortcut("Toggle Dual Panes")
      .withKey(KeyCode.KeyP)
      .withCtrlKey()
      .hasAction((event) => {
        panes.toggleDualPanes();
        event.preventDefault();
      })
      .register();

    new Shortcut("Go to Pane 1")
      .withKey(KeyCode.Digit1)
      .withAltKey()
      .hasAction(() => this.setActivePane(1))
      .register();

    new Shortcut("Go to Pane 2")
      .withKey(KeyCode.Digit2)
      .withAltKey()
      .hasAction(() => this.setActivePane(2))
      .register();

    new Shortcut("Toggle Hidden Files")
      .withKey(KeyCode.KeyH)
      .withCtrlKey()
      .hasAction(() => this.settings.toggleShowHiddenFiles())
      .register();

    new Shortcut("Open Keyboard Shortcuts")
      .withKey(KeyCode.KeyK)
      .withCtrlKey()
      .hasAction(() => KeyboardShortcuts.openAsDialog(this.dialogService))
      .register();

    new Shortcut("Navigate Up")
      .withKey(KeyCode.ArrowUp)
      .withAltKey()
      .hasAction(() => panes.active.tabs.active.goUp())
      .register();

    new Shortcut("Navigate Back")
      .withKey(KeyCode.ArrowLeft)
      .withAltKey()
      .hasAction(() => panes.active.tabs.active.goBack())
      .register();

    new Shortcut("Navigate Forward")
      .withKey(KeyCode.ArrowRight)
      .withAltKey()
      .hasAction(() => panes.active.tabs.active.goForward())
      .register();

    new Shortcut("Toggle Window Pin")
      .withKey(KeyCode.KeyP)
      .withAltKey()
      .hasAction(() => this.windowManager.togglePinWindow())
      .register();
  }

  private setActivePane(paneNumber: number) {
    const panes = this.windowManager.panes;
    if (paneNumber >= 1 && panes.list.length >= paneNumber) {
      panes.setActive(panes.list[paneNumber - 1]);
    }
  }

  private setActiveTab(tabNumber: number) {
    const tabs = this.windowManager.panes.active.tabs;
    if (tabNumber >= 1 && tabs.list.length >= tabNumber) {
      tabs.setActive(tabs.list[tabNumber - 1]);
    }
  }
}
