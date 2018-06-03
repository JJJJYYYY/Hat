import { IndexElement } from '@/type/editor'

export function isObject (anyVal: any) {
  return anyVal !== null && typeof anyVal === 'object'
}

export function deepCopy (obj: any) {
  if (isObject(obj)) {
    let newObj = Object.create(null)
    Object.keys(obj).forEach(k => {
      newObj[k] = deepCopy(obj[k])
    })
    return newObj
  } else {
    return obj
  }
}

export const copyElement = deepCopy

export function noop () {/* noop */}
