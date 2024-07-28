export const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const isUndefined = <T>(
  value: T | null | undefined
): value is null | undefined => !isDefined(value);
