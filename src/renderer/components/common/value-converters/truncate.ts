import { Util } from '../../../core';

export class TruncateValueConverter {
  public toView(str: string, maxLength: number): string {
    return Util.truncate(str, maxLength);
  }
}