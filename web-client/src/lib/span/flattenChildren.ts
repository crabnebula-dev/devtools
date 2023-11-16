import { Span } from "../connection/monitor";

export function flattenChildren(objects: Span[]): Span[] {
  let result: Span[] = [];

  objects.forEach((obj) => {
    const children = obj.children ?? [];
    const currentObj = { ...obj };
    currentObj.children = [];
    result.push(currentObj);

    if (children) {
      result = result.concat(flattenChildren(children));
    }
  });

  return result;
}
