import { bindShortcut } from "@domain";
import { KeyCode } from "common";

@bindShortcut("Toggle Header", KeyCode.KeyH, { alt: true })
export class ViewCommandToggleHeader {}
