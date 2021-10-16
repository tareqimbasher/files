import { globalShortcut } from 'electron';
import { WindowManager } from './window-manager';

export class EnvironmentManager {
    constructor(private readonly windowManager: WindowManager) {
    }

    public setup() {
        let shortcut: string;

        if (process.platform === 'darwin') {
            shortcut = 'Command+Control+W';
        }
        else {
            shortcut = 'Super+Alt+W';
        }

        globalShortcut.register(shortcut, this.windowManager.createWindow);
    }
}