import { TakeValueConverter } from "./core/value-converters/take";
import { TitleCaseFormatValueConverter } from "./core/value-converters/title-case-format";
import { TruncateValueConverter } from "./core/value-converters/truncate";

export const converters = [
    TakeValueConverter,
    TitleCaseFormatValueConverter,
    TruncateValueConverter,
];