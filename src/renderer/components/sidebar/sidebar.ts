import { Settings, system } from "../../core";
import { WindowManager } from "../window-manager";

export class Sidebar {

    public pinned: PinnedDirectory[] = [];

    constructor(public settings: Settings, public windowManager: WindowManager) {
    }

    public attached() {
        let homedir = system.os.homedir();
        this.pinned.push(
            new PinnedDirectory("Home", homedir),
            new PinnedDirectory("Desktop", system.path.join(homedir, "Desktop")),
            new PinnedDirectory("Downloads", system.path.join(homedir, "Downloads")),
            new PinnedDirectory("Documents", system.path.join(homedir, "Documents")),
            new PinnedDirectory("Pictures", system.path.join(homedir, "Pictures")),
            new PinnedDirectory("Music", system.path.join(homedir, "Music")),
            new PinnedDirectory("Videos", system.path.join(homedir, "Videos")),
        );
    }
}

class PinnedDirectory {
    constructor(public name: string, public path: string) {
    }
}