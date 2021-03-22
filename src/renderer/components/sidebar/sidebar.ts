import { Settings } from "../../core";
import { WindowManager } from "../window-manager";
import * as os from "os";
import * as path from "path";

export class Sidebar {

    public pinned: PinnedDirectory[] = [];

    constructor(public settings: Settings, public windowManager: WindowManager) {
    }

    public attached() {
        let homedir = os.homedir();
        this.pinned.push(
            new PinnedDirectory("Home", homedir),
            new PinnedDirectory("Desktop", path.join(homedir, "Desktop")),
            new PinnedDirectory("Downloads", path.join(homedir, "Downloads")),
            new PinnedDirectory("Documents", path.join(homedir, "Documents")),
            new PinnedDirectory("Pictures", path.join(homedir, "Pictures")),
            new PinnedDirectory("Music", path.join(homedir, "Music")),
            new PinnedDirectory("Videos", path.join(homedir, "Videos")),
        );
    }
}

class PinnedDirectory {
    constructor(public name: string, public path: string) {
    }
}