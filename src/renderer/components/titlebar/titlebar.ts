import { IObserverLocator } from "@aurelia/runtime-html";
import { singleton, watch } from "aurelia";
import { Color, Titlebar as CustomTitlebar } from "custom-electron-titlebar";
import { WindowManager } from "../window-manager";

export class Titlebar {

    private customTitlebar!: CustomTitlebar;

    constructor(private readonly windowManager: WindowManager, @IObserverLocator private readonly observerLocator: IObserverLocator) {
        this.init();
    }

    private init() {
        window.addEventListener('DOMContentLoaded', () => {
            this.customTitlebar = new CustomTitlebar({
                backgroundColor: Color.fromHex('#333'), // Default color, overriden in css
                unfocusEffect: true,
            });


            const replaceText = (selector: string, text: string) => {
                const element = document.getElementById(selector)
                if (element) element.innerText = text
            }

            for (const type of ['chrome', 'node', 'electron']) {
                replaceText(`${type}-version`, (<any>process).versions[type])
            }

            // Update title observer
            const observer = this.observerLocator.getObserver(this.windowManager.panes.active.tabs.active, 'pathName');
            observer.subscribe({
                handleChange: (newValue: string, oldValue: string) => {
                    this.customTitlebar.updateTitle(newValue);
                }
            });

            this.updateTitle();
        });
    }

    private updateTitle() {
        this.customTitlebar.updateTitle(this.windowManager.panes.active?.tabs.active?.pathName);
    }
}