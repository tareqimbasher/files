import { IEventAggregator } from "aurelia";
import { DrivesChangedEvent, DriveService, Settings, system } from "../../core";
import { WindowManager } from "../window-manager";

export class Sidebar {

    public directories: PinnedDirectory[] = [];
    public drives: PinnedDrive[] = [];
    public showDirectories = true;
    public showDrives = true;
    public detaches: (() => void)[] = [];

    constructor(
        public settings: Settings,
        public windowManager: WindowManager,
        private driveService: DriveService,
        @IEventAggregator private readonly eventBus: IEventAggregator) {
    }

    public attached() {
        let homedir = system.os.homedir();
        this.directories.push(
            new PinnedDirectory("Home", homedir),
            new PinnedDirectory("Desktop", system.path.join(homedir, "Desktop")),
            new PinnedDirectory("Downloads", system.path.join(homedir, "Downloads")),
            new PinnedDirectory("Documents", system.path.join(homedir, "Documents")),
            new PinnedDirectory("Pictures", system.path.join(homedir, "Pictures")),
            new PinnedDirectory("Music", system.path.join(homedir, "Music")),
            new PinnedDirectory("Videos", system.path.join(homedir, "Videos")),
        );

        const token = this.eventBus.subscribe(DrivesChangedEvent, message => this.loadDrives());
        this.detaches.push(() => token.dispose());
        this.loadDrives();
    }

    private loadDrives() {
        $('sidebar .ui.progress').progress('destroy');

        const pinned: PinnedDrive[] = [];

        this.driveService.list().then(drives => {

            for (let drive of drives) {
                pinned.push(new PinnedDrive(
                    drive.name,
                    drive.path,
                    Math.round(drive.size),
                    Math.round(drive.usedSize),
                    Math.round(drive.freeSize))
                );
            }

            this.drives = pinned;
            $('sidebar .ui.progress').progress();
        });
    }
}

class PinnedDirectory {
    constructor(public name: string, public path: string) {
    }
}

class PinnedDrive {
    constructor(
        public name: string, 
        public path: string,
        public size: number,
        public usedSize: number,
        public freeSize: number) {
    }

    public get usedPercent(): number {
        return Math.round((this.usedSize / this.size) * 100);
    };

    public get freePercent(): number {
        return Math.round((this.freeSize / this.size) * 100);
    };
}
