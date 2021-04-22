import { EventAggregator, singleton } from "aurelia";
import { FileViewTypes, Settings } from "../settings";
import { system } from "../system/system";
import { PersistedProfile } from "./persisted-profile";

@singleton
export class Profile {
    public name: string;
    public version: string;

    constructor(private settings: Settings, private eventBus: EventAggregator) {
        this.name = "Default";
        this.version = "1";
        this.eventBus.subscribe("settings-changed", () => this.save());
    }

    public load(): Profile {
        this.getPersisted().applyTo(this, this.settings);
        return this;
    }

    public save(): Profile {
        const persisted = this.getPersisted();
        persisted.saveFrom(this, this.settings);

        const settingsFilePath = this.ensureAndGetSettingsFilePath();
        system.fss.writeFileSync(
            settingsFilePath,
            JSON.stringify(persisted, null, 4), 'utf8');

        return this;
    }

    private getPersisted(): PersistedProfile {
        const settingsFilePath = this.ensureAndGetSettingsFilePath();
        const persisted = JSON.parse(system.fss.readFileSync(settingsFilePath, 'utf8')) as PersistedProfile;
        return PersistedProfile.from(persisted);
    }

    private ensureAndGetSettingsFilePath(): string {
        const appDataDir = system.app.getPath("userData");
        if (!system.fss.existsSync(appDataDir)) {
            system.fss.mkdirSync(appDataDir, {
                recursive: true
            });
        }

        const settingsFile = system.path.join(appDataDir, `profile-${this.name}.json`);
        if (!system.fss.existsSync(settingsFile)) {
            system.fss.writeFileSync(
                settingsFile,
                JSON.stringify(new PersistedProfile(), null, 4), 'utf8');
        }

        return settingsFile;
    }
}