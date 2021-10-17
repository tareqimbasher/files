import { IEventAggregator, singleton } from "aurelia";
import { Settings, SettingsChangedEvent, system } from "../";
import { PersistedProfile } from "./persisted-profile";
import md5 from "md5";

@singleton
export class Profile {
  public name: string;
  public version: string;

  constructor(
    private settings: Settings,
    @IEventAggregator private readonly eventBus: IEventAggregator
  ) {
    this.name = "Default";
    this.version = "1";
    this.eventBus.subscribe(SettingsChangedEvent, () => this.save());
  }

  public load(): Profile {
    this.getPersisted().applyTo(this, this.settings);
    return this;
  }

  public save(): Profile {
    const persisted = this.getPersisted();
    persisted.saveFrom(this, this.settings);

    const settingsFilePath = this.ensureAndGetSettingsFilePath();
    system.fss.writeFileSync(settingsFilePath, JSON.stringify(persisted, null, 4), "utf8");

    return this;
  }

  private getPersisted(): PersistedProfile {
    const settingsFilePath = this.ensureAndGetSettingsFilePath();
    const persisted = JSON.parse(
      system.fss.readFileSync(settingsFilePath, "utf8")
    ) as PersistedProfile;
    return PersistedProfile.from(persisted);
  }

  private ensureAndGetSettingsFilePath(): string {
    const profilesDir = system.path.join(system.remote.app.getPath("userData"), "profiles");
    if (!system.fss.existsSync(profilesDir)) {
      system.fss.mkdirSync(profilesDir, {
        recursive: true,
      });
    }

    const settingsFile = system.path.join(profilesDir, `profile-${md5(this.name)}.json`);
    if (!system.fss.existsSync(settingsFile)) {
      system.fss.writeFileSync(
        settingsFile,
        JSON.stringify(new PersistedProfile(), null, 4),
        "utf8"
      );
    }

    return settingsFile;
  }
}
