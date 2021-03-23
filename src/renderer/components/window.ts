import { EventAggregator } from "aurelia";
import { WindowManager } from "./window-manager";
import { Settings } from "../core";

export class Window {
    constructor(
        private settings: Settings,
        private windowManager: WindowManager,
        private eventBus: EventAggregator) {
    }

    public attached() {
        this.setupSidebarResizing();
        this.setupPaneResizing();
        this.setupKeyboardShortcuts();

        //setTimeout(() => {

        //    console.clear();

        //    console.log("homedir", os.homedir());
        //    console.log("hostname", os.hostname());
        //    console.log("networkInterfaces", os.networkInterfaces());
        //    console.log("release", os.release());
        //    console.log("userInfo", os.userInfo());
        //    console.log("type", os.userInfo());

        //}, 1000);
    }

    private setupSidebarResizing() {
        let sidebar = document.getElementsByTagName('sidebar')[0] as HTMLElement;
        let paneGroup = document.getElementsByTagName('pane-group')[0] as HTMLElement;
        this.setupResizing(sidebar, paneGroup);
    }

    private setupPaneResizing() {
        let panes = document.getElementsByTagName('pane');
        if (panes.length != 2)
            return;

        this.setupResizing(panes[0] as HTMLElement, panes[1] as HTMLElement);
        return;
    }

    private setupResizing(leftElement: HTMLElement, rightElement: HTMLElement) {

        let mousePosition: number;

        let resize = (ev: MouseEvent) => {
            // If mouse is not clicked
            if (ev.which == 0) {
                document.removeEventListener("mousemove", resize);
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

            rightElement.style.flex = "1 " + rightElementWidth + "px";
            leftElement.style.flex = "1 " + leftElementWidth + "px";
        };

        rightElement.addEventListener("mousedown", ev => {
            if (ev.target == rightElement && ev.offsetX < 10) {
                mousePosition = ev.x;
                document.addEventListener("mousemove", resize);
            }
        });

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", resize);
        });
    }

    private setupKeyboardShortcuts() {
        document.addEventListener("keydown", ev => {

            let panes = this.windowManager.panes;

            if (ev.ctrlKey && ev.which == 76) { // CTRL + L key
                this.eventBus.publish('kb-address-edit', {
                    id: panes.active.id
                });
            }
            else if (ev.ctrlKey && ev.which == 84) { // CTRL + T key
                panes.active.tabs.add().activate();
            }
            else if (ev.ctrlKey && ev.which >= 49 && ev.which <= 57) { // CTRL + 1-9 keys
                this.setActiveTab(ev.which - 48);
            }
            else if (ev.ctrlKey && ev.altKey && ev.which == 37) { // CTRL + ALT + LEFT keys
                let currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
                this.setActiveTab(currentTabNum - 1);
            }
            else if (ev.ctrlKey && ev.altKey && ev.which == 39) { // CTRL + ALT + RIGHT keys
                let currentTabNum = panes.active.tabs.list.indexOf(panes.active.tabs.active) + 1;
                this.setActiveTab(currentTabNum + 1);
            }
            else if (ev.altKey && ev.which == 38) { // ALT + UP key
                panes.active.tabs.active.goUp();
            }
            else if (ev.altKey && ev.which == 37) { // ALT + LEFT key
                panes.active.tabs.active.goBack();
            }
            else if (ev.altKey && ev.which == 39) { // ALT + RIGHT key
                panes.active.tabs.active.goForward();
            }
            else if (ev.altKey && ev.which == 49) { // ALT + 1 key
                this.setActivePane(1);
            }
            else if (ev.altKey && ev.which == 50) { // ALT + 2 key
                this.setActivePane(2);
            }
        });
    }

    private setActivePane(paneNumber: number) {
        let panes = this.windowManager.panes;
        if (paneNumber >= 1 && panes.list.length >= paneNumber) {
            panes.setActive(panes.list[paneNumber - 1]);
        }
    }

    private setActiveTab(tabNumber: number) {
        let tabs = this.windowManager.panes.active.tabs;
        if (tabNumber >= 1 && tabs.list.length >= tabNumber) {
            tabs.setActive(tabs.list[tabNumber - 1]);
        }
    }
}

