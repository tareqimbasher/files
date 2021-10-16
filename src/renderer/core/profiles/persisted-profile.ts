import { FileViewTypes, Settings } from '../settings';
import { Profile } from './profile';

export class PersistedProfile {
    public static latestVersion = '1';

    public name: string;
    public version: string;
    public settings: {
        theme?: string;
        showHiddenFiles?: boolean;
        fileViewType?: FileViewTypes;
        confirmOnMove?: boolean;
    };

    constructor() {
        // Defaults
        this.name = 'Default';
        this.version = '1';
        this.settings = {
            theme: 'dark',
            showHiddenFiles: false,
            confirmOnMove: true,
            fileViewType: FileViewTypes.Icons
        };
    }

    public applyTo(profile: Profile, settings: Settings) {
        profile.name = this.name;
        profile.version = this.version;

        settings.setTheme(this.settings.theme ?? 'dark');
        settings.setShowHiddenFiles(this.settings.showHiddenFiles === true ? true : false);
        settings.setConfirmOnMove(this.settings.confirmOnMove === false ? false : true);
        settings.setFileViewType(this.settings.fileViewType ?? FileViewTypes.Icons);
    }

    public saveFrom(profile: Profile, settings: Settings) {
        this.name = profile.name;
        this.version = profile.version;

        this.settings = {
            theme: settings.theme,
            showHiddenFiles: settings.showHiddenFiles,
            confirmOnMove: settings.confirmOnMove,
            fileViewType: settings.fileViewType,
        }
    }

    public static from(obj: PersistedProfile): PersistedProfile {
        const profile = new PersistedProfile();

        profile.name = obj.name ?? 'Default';
        profile.version = obj.version ?? PersistedProfile.latestVersion;

        if (obj.settings)
            profile.settings = obj.settings;

        return profile;
    }
}