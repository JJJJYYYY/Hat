import Vue from 'vue'

export interface Size {
  width: number,
  height: number
}

export interface BoxStore {
  id: number,
  vm: Vue
}

export interface Attr extends Size {
  x: number,
  y: number,
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

export interface EleLocation extends Coord, Size {
  i: number // index
}
