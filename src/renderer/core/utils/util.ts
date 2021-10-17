export class Util {
  public static newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Gets the difference of 2 dates in number of days
   * @param a
   * @param b
   */
  public static dateDiffInDays(a: Date, b: Date): number {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    // 8.64e+7 milliseconds = 1 day
    return Math.floor(Math.abs(utc2 - utc1) / 8.64e+7);
  }

  /**
   * Converts a string to title case.
   * @param str string
   */
  public static toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Truncates a string.
   * @param str string
   */
  public static truncate(str: string, maxLength: number) {
    if (!str || maxLength < 0 || str.length <= maxLength)
      return str;

    return str.substr(0, maxLength - 3) + '...';
  }

  /**
   * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the
   * debounced function was invoked.
   * @param thisContext The context of 'this'
   * @param func The function to debounce.
   * @param waitMs The number of milliseconds to debounce.
   * @param immediate If true, will execute the function immediatly and then waits for the interval before being called again.
   */
  // public static debounce(thisContext: any, func: Function, waitMs: number, immediate?: boolean) {
  //     let timeout: any;
  //
  //     return function executedFunction() {
  //         const args = arguments;
  //
  //         const later = function () {
  //             timeout = null;
  //             if (!immediate) func.apply(thisContext, args);
  //         };
  //
  //         const callNow = immediate && !timeout;
  //
  //         clearTimeout(timeout);
  //
  //         timeout = setTimeout(later, waitMs);
  //
  //         if (callNow) func.apply(thisContext, args);
  //     };
  // }
}