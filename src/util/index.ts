export function isObject (anyVal: any): boolean {
  return anyVal !== null && typeof anyVal === 'object'
}

export function deepCopy<T> (tar: T): T {
  if (isObject(tar)) {
    let newObj = Object.create(null)
    Object.keys(tar).forEach(k => {
      newObj[k] = deepCopy<any>((tar as any)[k])
    })
    return newObj
  } else if (Array.isArray(tar)) {
    return tar.map((t: any) => deepCopy<any>(t)) as any
  } else {
    return tar
  }
}

export const copyElement = deepCopy

export function noop (): void {/* noop */}
