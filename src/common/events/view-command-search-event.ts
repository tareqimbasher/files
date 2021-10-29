import { bindShortcut } from "../shortcuts/bind-shortcut";
import { KeyCode } from "../utils/keycodes";

@bindShortcut("Focus Search", KeyCode.KeyS, { ctrl: true })
export class ViewCommandSearchEvent {}
