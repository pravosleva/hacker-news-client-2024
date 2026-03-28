/* eslint-disable @typescript-eslint/no-explicit-any */
export const getNestedValue = ({ obj, path }: {
  obj: any;
  path: string;
}) => {
  const arr = path.split(/[.[]['"]?/)
  let o = obj;
  while (arr.length && o) {
    o = o[(arr as any).shift().replace(/['"]?]$/, '')]
  }
  return o
}
