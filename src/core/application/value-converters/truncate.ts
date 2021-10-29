import { Util } from "common";

export class TruncateValueConverter {
  public toView(str: string, maxLength: number): string {
    return Util.truncate(str, maxLength);
  }
}
