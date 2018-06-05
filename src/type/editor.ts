import Vue from 'vue'
import { MODEL } from '@/enum/editor'

export interface Size {
  width: number
  height: number
}

export interface BoxStore {
  id: number
  vm: Vue
}

export interface Attr extends Size {
  x: number
  y: number
  [key: string]: any
}

export interface Element {
  type: string
  attrs: Attr
  text?: string // only <text>
}

export interface Coord {
  x: number
  y: number
  z?: number
}

export interface EleLocation extends Coord, Size {
  i: number // index
}

export interface EleBox extends Vue {
  boxId: number
  [MODEL.SCALE]: Function
  [MODEL.MOVE]: Function
  [MODEL.ROTATE]: Function
}

export interface EleChangeStage {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
}
