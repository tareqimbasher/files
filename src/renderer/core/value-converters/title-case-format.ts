import { Util } from "../";

export class TitleCaseFormatValueConverter {
    toView(value: string) {
        if (!value) return value;
        return Util.toTitleCase(value);
    }
}