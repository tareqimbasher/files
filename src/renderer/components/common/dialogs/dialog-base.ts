import { IDialogDom, DefaultDialogDom, IDialogController } from '@aurelia/runtime-html';

export abstract class DialogBase {

    protected constructor(
        @IDialogDom protected readonly dialogDom: DefaultDialogDom,
        @IDialogController protected readonly controller: IDialogController) {
        
        dialogDom.contentHost.classList.add('dialog');
        dialogDom.contentHost.style.position = 'relative';
        dialogDom.contentHost.style.margin = 'auto';
        dialogDom.contentHost.style.zIndex = '2';
        // dialogDom.contentHost.style.display = "flex";
        // dialogDom.contentHost.style.justifyContent = "center";
        // dialogDom.contentHost.style.alignItems = "center";
        // dialogDom.contentHost.style.top = "50%";
        // dialogDom.contentHost.style.transform = "translateY(-50%)";
        dialogDom.overlay.style.zIndex = '1';
        dialogDom.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }

    public attaching() {
        const animation = this.dialogDom.contentHost.animate(
            [{ opacity: '0' }, { opacity: '1' }],
            { duration: 100 },
        );
        return animation.finished;
    }

    public detaching() {
        const animation = this.dialogDom.contentHost.animate(
            [{ opacity: '1' }, { opacity: '0' }],
            { duration: 100 },
        );
        return animation.finished;
    }
}