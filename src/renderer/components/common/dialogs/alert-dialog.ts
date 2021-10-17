import {
  DefaultDialogDom,
  IDialogController,
  IDialogDom,
  IDialogService,
} from "@aurelia/runtime-html";
import { Settings } from "../../../core";
import { DialogBase } from "./dialog-base";

export class AlertDialogHelper {
  constructor(@IDialogService private readonly dialogService: IDialogService) {}

  public async alert(title: string, text: string, type?: AlertDialogType): Promise<void> {
    const opened = await this.dialogService.open({
      component: () => AlertDialog,
      model: new AlertDialogOptions({
        title: title,
        text: text,
        type: type || AlertDialogType.Info,
      }),
    });

    await opened.dialog.closed;
  }

  public async confirm(
    title: string,
    text: string,
    confirmButtonText: string,
    confirmButtonType?: AlertDialogButtonType,
    type?: AlertDialogType
  ): Promise<boolean> {
    const opened = await this.dialogService.open({
      component: () => AlertDialog,
      model: new AlertDialogOptions({
        title: title,
        text: text,
        type: type || AlertDialogType.Question,
        buttons: [
          {
            type: confirmButtonType || AlertDialogButtonType.Primary,
            text: confirmButtonText,
            value: "yes",
          },
          AlertDialogOptions.CANCEL_BUTTON,
        ],
      }),
    });

    const result = await opened.dialog.closed;
    return result.value === "yes";
  }
}

export class AlertDialog extends DialogBase {
  public options?: AlertDialogOptions;
  public customStyles = "";

  constructor(
    @IDialogDom dialogDom: DefaultDialogDom,
    @IDialogController controller: IDialogController,
    private readonly settings: Settings
  ) {
    super(dialogDom, controller);
  }

  public activate(options: AlertDialogOptions) {
    this.options = options;

    if (this.options.maxWidth) {
      this.customStyles = `max-width: ${options.maxWidth};`;
    }
  }
}

export enum AlertDialogType {
  Info = "Info",
  Success = "Success",
  Error = "Error",
  Warning = "Warning",
  Question = "Question",
}

export enum AlertDialogButtonType {
  Default = "Default",
  Primary = "Primary",
  Danger = "Danger",
  Cancel = "Cancel",
}

export interface IAlertDialogButton {
  value: string;
  text: string;
  type?: AlertDialogButtonType;
}

export class AlertDialogOptions {
  public static OK_BUTTON: IAlertDialogButton = {
    value: "ok",
    text: "OK",
    type: AlertDialogButtonType.Primary,
  };
  public static CANCEL_BUTTON: IAlertDialogButton = {
    value: "cancel",
    text: "Cancel",
    type: AlertDialogButtonType.Cancel,
  };
  public static YES_BUTTON: IAlertDialogButton = {
    value: "yes",
    text: "Yes",
    type: AlertDialogButtonType.Default,
  };
  public static NO_BUTTON: IAlertDialogButton = {
    value: "no",
    text: "No",
    type: AlertDialogButtonType.Default,
  };
  public static YES_NO_BUTTONS: IAlertDialogButton[] = [
    AlertDialogOptions.YES_BUTTON,
    AlertDialogOptions.NO_BUTTON,
  ];
  public title: string;
  public text: string;
  public maxWidth?: string;
  public type?: AlertDialogType;
  public buttons: IAlertDialogButton[];

  constructor(options: {
    title: string;
    text: string;
    buttons?: IAlertDialogButton[];
    type?: AlertDialogType;
    maxWidth?: string;
  }) {
    this.title = options.title;
    this.text = options.text?.replaceAll("\n", "<br/>");
    this.type = options.type;
    this.maxWidth = options.maxWidth;

    if (options.buttons) this.buttons = options.buttons;
    else {
      this.buttons = [AlertDialogOptions.OK_BUTTON];
    }
  }
}
