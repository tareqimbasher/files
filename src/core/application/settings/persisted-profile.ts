import { Profile } from "./profile";

export class PersistedProfile {
  public static defaultName = "Default";
  public static latestVersion = "1";

  public name = PersistedProfile.defaultName;
  public version = PersistedProfile.latestVersion;
  public settings = new Map<string, unknown>();

  public static from(from: PersistedProfile): PersistedProfile {
    const persisted = new PersistedProfile();

    persisted.name = from.name ?? PersistedProfile.defaultName;
    persisted.version = from.version ?? PersistedProfile.latestVersion;
    if (from.settings?.size > 0) {
      persisted.settings = new Map<string, unknown>(from.settings);
    }

    return persisted;
  }

  public applyTo(profile: Profile) {
    profile.name = this.name;
    profile.version = this.version;

    for (const key of profile.settings.values.keys()) {
      if (this.settings.has(key)) {
        profile.settings.values.set(key, this.settings.get(key));
      }
    }
  }

  public hydrateFrom(profile: Profile) {
    this.name = profile.name;
    this.version = profile.version;

    this.settings.clear();
    for (const key of profile.settings.values.keys()) {
      this.settings.set(key, profile.settings.values.get(key));
    }
  }
}
