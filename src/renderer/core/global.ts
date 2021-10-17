/**
 * Creates a proimise that resolves after the specified number of milliseconds.
 * @param ms The delay in milliseconds.
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
