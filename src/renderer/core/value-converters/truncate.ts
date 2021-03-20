import { Util } from "../";

export class TruncateValueConverter {
    public toView(str: string, maxLength: number) {
        return Util.truncate(str, maxLength);
    }
}