import { Settings } from '../settings';

export class SettingsChangedEvent {
  constructor(public settings: Settings) {
  }
}