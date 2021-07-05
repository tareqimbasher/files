import { App, Menu, nativeImage, Tray } from "electron";
import { WindowManager } from "./window-manager";
import * as path from "path";

export class TrayAndDockManager {
    public tray?: Tray;
    private logoPath = path.join(__dirname, '../renderer/assets/logo.png');

    constructor(private readonly app: App, private readonly windowManager: WindowManager) {
    }

    public setup() {
        this.createTray();
        this.createDockJumpList();
    }

    private createTray(): void {
        if (this.tray)
            return;

        const logo = nativeImage.createFromPath(this.logoPath)
            .resize({
                width: 16
            });

        this.tray = new Tray(logo);

        this.tray.on('click', () => this.windowManager.openLastWindowOrCreateNew());

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Open',
                icon: logo,
                click: () => {
                    this.windowManager.openLastWindowOrCreateNew();
                }
            },
            {
                label: 'New Window',
                icon: logo,
                click: () => {
                    this.windowManager.createWindow();
                }
            },
            {
                label: 'Quit',
                click: () => {
                    for (var window of Array.from(this.windowManager.windows)) {
                        window.close();
                    }

                    this.app.quit();
                }
            },
        ])

        this.tray.setContextMenu(contextMenu);
    }

    private createDockJumpList() {
        this.app.setUserTasks([
            {
                program: process.execPath,
                arguments: '--new-window',
                iconPath: this.logoPath,
                iconIndex: 0,
                title: 'New Window',
                description: 'Create a new window'
            }
        ]);
    }
}