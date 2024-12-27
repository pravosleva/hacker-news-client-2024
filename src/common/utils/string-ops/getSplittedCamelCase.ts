// NOTE: Function to extract a word
export function getSplittedCamelCase(identifier: string): string[] {
  return identifier.match(/.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)/g) || [];
}
