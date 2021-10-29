import { IObserverLocator, singleton } from "aurelia";
import { CollectionSubscriber, Settings, system } from "../";
import { PersistedProfile } from "./persisted-profile";
import { JsonSerializer } from "../../../common";
import md5 from "md5";

@singleton
export class Profile {
  public name: string;
  public version: string;
  private loading = false;

  constructor(
    public readonly settings: Settings,
    @IObserverLocator private readonly observerLocator: IObserverLocator
  ) {
    this.name = "Default";
    this.version = "1";

    this.observerLocator.getMapObserver(this.settings.values).subscribe(
      new CollectionSubscriber((indexMap) => {
        if (!this.loading) this.save();
      })
    );
  }

  public load(): Profile {
    this.loading = true;
    this.getPersisted().applyTo(this);
    this.loading = false;
    return this;
  }

  public save(): Profile {
    console.warn("Saving");
    const persisted = this.getPersisted();
    persisted.hydrateFrom(this);

    const settingsFilePath = this.ensureAndGetSettingsFilePath();
    system.fs.writeFileSync(settingsFilePath, JsonSerializer.serialize(persisted, true), "utf8");

    return this;
  }

  private getPersisted(): PersistedProfile {
    const settingsFilePath = this.ensureAndGetSettingsFilePath();
    const persisted = JsonSerializer.deserialize<PersistedProfile>(
      system.fs.readFileSync(settingsFilePath, "utf8")
    );
    return PersistedProfile.from(persisted);
  }

  private ensureAndGetSettingsFilePath(): string {
    const profilesDir = system.path.join(system.remote.app.getPath("userData"), "profiles");
    if (!system.fs.existsSync(profilesDir)) {
      system.fs.mkdirSync(profilesDir, {
        recursive: true,
      });
    }

    const settingsFile = system.path.join(profilesDir, `profile-${md5(this.name)}.json`);
    if (!system.fs.existsSync(settingsFile)) {
      system.fs.writeFileSync(
        settingsFile,
        JSON.stringify(new PersistedProfile(), null, 4),
        "utf8"
      );
    }

    return settingsFile;
  }
}
