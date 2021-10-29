export class JsonSerializer {
  public static serialize(value: unknown, formatted = false): string {
    return JSON.stringify(value, this.replacer, formatted ? 2 : 0);
  }

  public static deserialize<T>(text: string): T {
    return JSON.parse(text, this.reviver) as T;
  }

  private static replacer(key: string, value: unknown) {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()),
      };
    } else {
      return value;
    }
  }

  private static reviver(key: string, value: any) {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
        return new Map(value.value);
      }
    }
    return value;
  }
}
