import { DialogBase } from '../../common';
import { DefaultDialogDom, IDialogController, IDialogDom, IDialogService } from '@aurelia/runtime-html';
import { Settings } from '../../../core';

export class KeyboardShortcuts extends DialogBase {
  public navigationShortcuts = [
    { description: 'Address bar', combo: 'CTRL + L' },
    { description: 'Back', combo: 'ALT + Left Arrow' },
    { description: 'Forward', combo: 'ALT + Right Arrow' },
    { description: 'Up', combo: 'ALT + Right Arrow' },
  ];
  
  public tabShortcuts = [
    { description: 'New tab', combo: 'CTRL + T' },
    { description: 'Close tab', combo: 'CTRL + W' },
    { description: 'Go to tab', combo: 'CTRL + [1-9]' },
    { description: 'Go to tab to the right', combo: 'CTRL + Right Arrow' },
    { description: 'Go to tab to the left', combo: 'CTRL + Left Arrow' },
  ];

  public paneShortcuts = [
    { description: 'Toggle second pane', combo: 'CTRL + P' },
    { description: 'Go to pane 1', combo: 'ALT + 1' },
    { description: 'Go to pane 2', combo: 'ALT + 2' },
  ];

  public fileShortcuts = [
    { description: 'Show hidden files', combo: 'CTRL + H' },
    { description: 'Search', combo: 'CTRL + S' },
  ];

  public otherShortcuts = [
    { description: 'Toggle keyboard shortcuts', combo: 'CTRL + K' },
  ];
  
  constructor(
    private readonly settings: Settings,
    @IDialogDom dialogDom: DefaultDialogDom,
    @IDialogController controller: IDialogController) {
    super(dialogDom, controller);
  }

  private static openedDialog: IDialogController | null = null;
  
  public static async openAsDialog(dialogService: IDialogService): Promise<void> {
    if (this.openedDialog)
    {
      await this.openedDialog.cancel();
      this.openedDialog = null;
      return;
    }
      
    const opened = await dialogService.open({
      component: () => KeyboardShortcuts
    });
    
    this.openedDialog = opened.dialog;
    await opened.dialog.closed;
    this.openedDialog = null;
  }
}