import { IEventAggregator } from "aurelia";
import { Drive, DriveService } from "@domain";
import { WindowManager } from "../window-manager";
import { system } from "common";
import { DrivesChangedEvent, Settings, ViewCommandToggleSidebar } from "application";

export class Sidebar {
  public isVisible = true;
  public directories: PinnedDirectory[] = [];
  public drives: Drive[] = [];
  public showDirectories = true;
  public showDrives = true;

  constructor(
    public settings: Settings,
    public windowManager: WindowManager,
    private driveService: DriveService,
    @IEventAggregator private readonly eventBus: IEventAggregator
  ) {
    this.windowManager.setSidebar(this);
  }

  public attached() {
    const homedir = system.os.homedir();
    this.directories.push(
      new PinnedDirectory("Home", homedir),
      new PinnedDirectory("Desktop", system.path.join(homedir, "Desktop")),
      new PinnedDirectory("Downloads", system.path.join(homedir, "Downloads")),
      new PinnedDirectory("Documents", system.path.join(homedir, "Documents")),
      new PinnedDirectory("Pictures", system.path.join(homedir, "Pictures")),
      new PinnedDirectory("Music", system.path.join(homedir, "Music")),
      new PinnedDirectory("Videos", system.path.join(homedir, "Videos"))
    );

    this.eventBus.subscribe(DrivesChangedEvent, (message) => this.loadDrives());
    this.loadDrives();

    this.eventBus.subscribe(ViewCommandToggleSidebar, () => (this.isVisible = !this.isVisible));
  }

  private loadDrives() {
    $("sidebar .ui.progress").progress("destroy");

    this.driveService.list().then((drives) => {
      this.drives = drives;
      $("sidebar .ui.progress").progress();
    });
  }
}

class PinnedDirectory {
  constructor(public name: string, public path: string) {}
}
