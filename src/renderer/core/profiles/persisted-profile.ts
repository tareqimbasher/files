import { FileViewTypes } from "../settings";

export class PersistedProfile {
    public static latestVersion = "1";

    public name: string;
    public version: string;
    public settings: {
        theme?: string;
        showHiddenFiles?: boolean;
        fileViewType?: FileViewTypes;
    }

    constructor() {
        // Defaults
        this.name = "Default";
        this.version = "1";
        this.settings = {
            theme: "dark",
            showHiddenFiles: false,
            fileViewType: FileViewTypes.Icons
        };
    }

    public static from(obj: PersistedProfile): PersistedProfile {
        const profile = new PersistedProfile();

        profile.name = obj.name ?? "Default";
        profile.version = obj.version ?? PersistedProfile.latestVersion;

        if (obj.settings)
            profile.settings = obj.settings;

        return profile;
    }
}