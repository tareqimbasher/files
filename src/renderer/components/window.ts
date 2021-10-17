import { IEventAggregator } from 'aurelia';
import {
    KeyCode,
    KeyCodeUtil,
    Profile,
    Settings,
    ViewCommandEditAddressBarEvent,
    ViewCommandSearchEvent
} from '../core';
import { IpcEventBus } from '../core/ipc/ipc-event-bus';
import { Titlebar } from './titlebar/titlebar';
import { WindowManager } from './window-manager';
import { IDialogService } from '@aurelia/runtime-html';
import { KeyboardShortcuts } from './dialogs/keyboard-shortcuts/keyboard-shortcuts';

export class Window {
  constructor(
    private titleBar: Titlebar,
    private profile: Profile,
    private settings: Settings,
    private windowManager: WindowManager,
    ipcEventBus: IpcEventBus,
    @IEventAggregator private readonly eventBus: IEventAggregator,
    @IDialogService private readonly dialogService: IDialogService
  ) {
    profile.load();
  }

  public attached() {
    this.setupSidebarResizing();
    this.setupPaneResizing();
    this.setupKeyboardShortcuts();
  }

  private setupSidebarResizing() {
    const sidebar = document.getElementsByTagName('sidebar')[0] as HTMLElement;
    const paneGroup = document.getElementsByTagName('pane-group')[0] as HTMLElement;
    this.setupResizing(sidebar, paneGroup);
  }

  private setupPaneResizing() {
    const panes = document.getElementsByTagName('pane-view');
    if (panes.length != 2)
      return;

    this.setupResizing(panes[0] as HTMLElement, panes[1] as HTMLElement);
    return;
  }

  private setupResizing(leftElement: HTMLElement, rightElement: HTMLElement) {

    let mousePosition: number;

    const resize = (ev: MouseEvent) => {
      // If mouse is not clicked
      if (ev.which == 0) {
        document.removeEventListener('mousemove', resize);
        return;
      }

      const dx = mousePosition - ev.x;
      mousePosition = ev.x;

      let rightElementWidth = parseInt(getComputedStyle(rightElement, '').width);
      (parseInt(getComputedStyle(rightElement, ':before')?.width) || 0) +
      (parseInt(getComputedStyle(rightElement, ':after')?.width) || 0);

      let leftElementWidth = parseInt(getComputedStyle(leftElement, '').width);
      (parseInt(getComputedStyle(leftElement, ':before')?.width) || 0) +
      (parseInt(getComputedStyle(leftElement, ':after')?.width) || 0);

      rightElementWidth += dx;
      leftElementWidth -= dx;

      rightElement.style.flex = '1 ' + rightElementWidth + 'px';
      leftElement.style.flex = '1 ' + leftElementWidth + 'px';
    };

    rightElement.addEventListener('mousedown', ev => {
      if (ev.target == rightElement && ev.offsetX < 10) {
        mousePosition = ev.x;
        document.addEventListener('mousemove', resize);
      }
    });

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', resize);
    });
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', ev => {

      const panes = this.windowManager.panes;

      if (ev.ctrlKey && ev.code == KeyCode.KeyL) {
        this.eventBus.publish(new ViewCommandEditAddressBarEvent());
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyS) {
        this.eventBus.publish(new ViewCommandSearchEvent());
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyT) {
        panes.active.tabs.add().activate();
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyW) {
        panes.active.tabs.active.close();
        ev.preventDefault();
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyP) {
        panes.toggleDualPanes();
        ev.preventDefault();
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyH) {
        this.settings.setShowHiddenFiles(!this.settings.showHiddenFiles);
      } else if (ev.ctrlKey && ev.code == KeyCode.KeyK) {
        KeyboardShortcuts.openAsDialog(this.dialogService);
      } else if (ev.ctrlKey && KeyCodeUtil.isDigit(ev.code)) {
        const digit = KeyCodeUtil.parseDigit(ev.code);
        if (digit > 0)
          this.setActiveTab(digit);
      } else if (ev.ctrlKey && ev.code == KeyCode.ArrowLeft) {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum - 1);
      } else if (ev.ctrlKey && ev.code == KeyCode.ArrowRight) {
        const currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
        this.setActiveTab(currentTabNum + 1);
      } else if (ev.altKey && ev.code == KeyCode.ArrowUp) {
        panes.active.tabs.active.goUp();
      } else if (ev.altKey && ev.code == KeyCode.ArrowLeft) {
        panes.active.tabs.active.goBack();
      } else if (ev.altKey && ev.code == KeyCode.ArrowRight) {
        panes.active.tabs.active.goForward();
      } else if (ev.altKey && ev.code == KeyCode.Digit1) {
        this.setActivePane(1);
      } else if (ev.altKey && ev.code == KeyCode.Digit2) {
        this.setActivePane(2);
      }
    });
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

