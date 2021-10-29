import { bindShortcut } from "@domain";
import { KeyCode } from "common";

@bindShortcut("Focus Search", KeyCode.KeyS, { ctrl: true })
export class ViewCommandSearchEvent {}
