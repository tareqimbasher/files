import { Util } from "common";

export class TitleCaseFormatValueConverter {
  public toView(value: string): string {
    if (!value) return value;
    return Util.toTitleCase(value);
  }
}
