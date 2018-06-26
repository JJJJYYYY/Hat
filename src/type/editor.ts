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

export interface Attrs extends Size {
  x: number
  y: number
  rotate: number
  [key: string]: any
}

export interface HatElement {
  type: string
  attrs: Attrs
  text?: string // only <text>
}

export interface Coord {
  x: number
  y: number
  z?: number
}

export interface EleLocation extends Coord, Size {
  i?: number // index
}

export interface EleBox extends Vue {
  boxId: number
  commit: Function
  [MODEL.SCALE]: Function
  [MODEL.MOVE]: Function
  [MODEL.ROTATE]: Function
}

export interface EleChangeStage {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number,
  rotate: number
}
