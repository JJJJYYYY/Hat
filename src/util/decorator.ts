import Vue from 'vue'

import { noop } from '@/util'

// not capture and passive

// event decorate self
export function self (
  target: Vue,
  name: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) {
  let method = descriptor.value || noop

  descriptor.value = function (...args: any[]) {
    const e = args.find(a => a instanceof Event)
    if (!e) console.warn('event not exist')
    if (e && e.target !== e.currentTarget) return
    return method.apply(this, args)
  }

  return descriptor
}

// event decorate stop
export function stop (
  target: Vue,
  name: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) {
  let method = descriptor.value || noop

  descriptor.value = function (...args: any[]) {
    const e: Event = args.find(a => a instanceof Event)
    e ? e.stopPropagation() : console.warn('event not exist')

    return method.apply(this, args)
  }

  return descriptor
}

// event decorate prevent
export function prevent (
  target: Vue,
  name: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) {
  let method = descriptor.value || noop

  descriptor.value = function (...args: any[]) {
    const e: Event = args.find(a => a instanceof Event)
    e ? e.preventDefault() : console.warn('event not exist')

    return method.apply(this, args)
  }

  return descriptor
}

// event decorate once
export function once (
  target: Vue,
  name: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) {
  let method = descriptor.value || noop

  descriptor.value = function () {
    let result = method.apply(this, arguments)
    method = noop

    return result
  }

  return descriptor
}

function createKeyDecorator (
  keyCode: string
) {
  return function (
    target: Vue,
    name: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
  ) {
    let method = descriptor.value || noop

    descriptor.value = function (...args: any[]) {
      const e = args.find(a => a instanceof MouseEvent)
      if (e[`${keyCode}Key`]) {
        return method.apply(this, args)
      }
    }

    return descriptor
  }
}

export const ctrl = createKeyDecorator('ctrl')
// export const alt = createKeyDecorator('alt')
// export const shift = createKeyDecorator('shift')
// export const meta = createKeyDecorator('meta')
