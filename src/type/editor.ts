import Vue from 'vue'

export interface BoxStore {
  id: number,
  vm: Vue
}

export interface Attr {
  [key: string]: string | number
}

export interface Element {
  type: string,
  attrs: Attr,
  text?: string, // only <text>
}
