import { Util } from '../../../core';

export class TitleCaseFormatValueConverter {
    public toView(value: string): string {
        if (!value) return value;
        return Util.toTitleCase(value);
    }
}