import Vue from 'vue'

export interface BoxStore {
  id: number,
  vm: Vue
}

export interface Attr {
  x: number,
  y: number,
  width: number,
  height: number,
  [key: string]: string | number
}

export interface Element {
  type: string,
  attrs: Attr,
  text?: string, // only <text>
}

export interface IndexElement extends Element {
  i: number
}

export interface Coord {
  x: number,
  y: number,
  z?: number
}

export interface EleLocation extends Coord {
  i: number, // index
  w: number,
  h: number
}
