import { bindShortcut, KeyCode } from "common";

@bindShortcut("Toggle Header", KeyCode.KeyH, { alt: true })
export class ViewCommandToggleHeader {}
