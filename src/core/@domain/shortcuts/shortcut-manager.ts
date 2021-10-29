import { IEventAggregator } from "aurelia";
import { Shortcut } from "./shortcut";
import { KeyCode, KeyCodeUtil } from "common";
import { WindowManager } from "../../../renderer/components";
import { Settings } from "application";
import { ShortcutActionExecutionContext } from "@domain/shortcuts/shortcut-action-execution-context";

/**
 * Manages shortcuts.
 */
export class ShortcutManager {
  private static registry: Shortcut[] = [];
  private static registry2: Map<Node, Shortcut[]> = new Map<Node, Shortcut[]>();

  constructor(
    private windowManager: WindowManager,
    private settings: Settings,
    @IEventAggregator private readonly eventBus: IEventAggregator
  ) {}

  public static registerShortcut(shortcut: Shortcut, onElement: Node = document) {
    const existing = this.registry.findIndex((s) => s.matches(shortcut));
    if (existing >= 0) {
      this.registry[existing] = shortcut;
    } else {
      this.registry.push(shortcut);
    }
  }

  public handleKeyCombo(event: KeyboardEvent) {
    const target = event.target;
    const currentTarget = event.currentTarget;

    console.warn("target", target, "currentTarget", currentTarget);

    // const shortcut = ShortcutManager.registry2.find((s) => s.matches(event));
    // if (!shortcut) return;
    //
    // shortcut.action(event, this.eventBus);
  }

  public setupKeyboardShortcuts() {
    this.setupApplicationWideKeyboardShortcuts();

    document.addEventListener("keydown", (ev) => {
      const target = ev.target;
      const currentTarget = ev.currentTarget;

      console.warn(target, currentTarget);

      const shortcut = ShortcutManager.registry.find((s) => s.matches(ev));
      if (!shortcut) return;

      const context = new ShortcutActionExecutionContext(ev, this.settings, this.eventBus);

      shortcut.action(context);
    });
  }

  private setupApplicationWideKeyboardShortcuts() {
    const panes = this.windowManager.panes;

    new Shortcut("New Tab")
      .withCtrlKey()
      .withKey(KeyCode.KeyT)
      .hasAction(() => panes.active.tabs.add().activate())
      .configurable()
      .register();

    new Shortcut("Close Current Tab")
      .withCtrlKey()
      .withKey(KeyCode.KeyW)
      .hasAction((ctx) => {
        panes.active.tabs.active.close();
        ctx.event.preventDefault();
      })
      .configurable()
      .register();

    new Shortcut("Go to Left Tab")
      .withCtrlKey()
      .withKey(KeyCode.ArrowLeft)
      .hasAction(() => {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum - 1);
      })
      .configurable()
      .register();

    new Shortcut("Go to Right Tab")
      .withCtrlKey()
      .withKey(KeyCode.ArrowRight)
      .hasAction(() => {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum + 1);
      })
      .configurable()
      .register();

    new Shortcut("Go to Tab")
      .withCtrlKey()
      .withKeyExpression((keyCode) => KeyCodeUtil.isDigit(keyCode))
      .hasAction((ctx) => {
        const digit = KeyCodeUtil.parseDigit(ctx.event.code);
        if (digit > 0) this.setActiveTab(digit);
      })
      .configurable()
      .register();

    new Shortcut("Toggle Dual Panes")
      .withCtrlKey()
      .withKey(KeyCode.KeyP)
      .hasAction((ctx) => {
        panes.toggleDualPanes();
        ctx.event.preventDefault();
      })
      .configurable()
      .register();

    new Shortcut("Go to Pane 1")
      .withAltKey()
      .withKey(KeyCode.Digit1)
      .hasAction(() => this.setActivePane(1))
      .configurable()
      .register();

    new Shortcut("Go to Pane 2")
      .withAltKey()
      .withKey(KeyCode.Digit2)
      .hasAction(() => this.setActivePane(2))
      .configurable()
      .register();

    new Shortcut("Toggle Hidden Files")
      .withCtrlKey()
      .withKey(KeyCode.KeyH)
      .hasAction(() => this.settings.toggleShowHiddenFiles())
      .configurable()
      .register();

    new Shortcut("Open Keyboard Shortcuts")
      .withCtrlKey()
      .withKey(KeyCode.KeyK)
      .hasAction(() => this.windowManager.showKeyboardShortcuts())
      .configurable()
      .register();

    new Shortcut("Navigate Up")
      .withAltKey()
      .withKey(KeyCode.ArrowUp)
      .hasAction(() => panes.active.tabs.active.goUp())
      .configurable()
      .register();

    new Shortcut("Navigate Back")
      .withAltKey()
      .withKey(KeyCode.ArrowLeft)
      .hasAction(() => panes.active.tabs.active.goBack())
      .configurable()
      .register();

    new Shortcut("Navigate Forward")
      .withAltKey()
      .withKey(KeyCode.ArrowRight)
      .hasAction(() => panes.active.tabs.active.goForward())
      .configurable()
      .register();

    new Shortcut("Toggle Window Pin")
      .withAltKey()
      .withKey(KeyCode.KeyP)
      .hasAction(() => this.windowManager.togglePinWindow())
      .configurable()
      .register();

    new Shortcut("Toggle Header")
      .withAltKey()
      .withKey(KeyCode.KeyH)
      .hasAction((ctx) => ctx.settings.toggleHeaderMinimized())
      .configurable()
      .register();

    new Shortcut("Toggle Sidebar")
      .withAltKey()
      .withKey(KeyCode.KeyS)
      .hasAction((ctx) => ctx.settings.toggleSideBarMinimized())
      .configurable()
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
