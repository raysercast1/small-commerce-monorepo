/**
 * Check if an object is an object and if it's not empty.
 * If the argument is not an object or if the object is empty, returns false, otherwise return true.
 * @param obj
 * @returns boolean
 * */
export function isObjectNotEmpty(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  return Object.keys(obj).length > 0;
}
