import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'

import { HatElement, Coord, Attrs, EleChangeStage, EleLocation } from '@/types/editor'
import { copyElement, noop } from '@/util'
import getDrawMethod, { getRectPath } from '@/util/draw'
import { TYPE } from '@/enum/store'

import Box from './Box'
import DrawPath from './DrawPath'
import { MODEL } from '@/enum/editor'

@Component
export default class DrawPen extends Vue {
  name = 'Draw'

  draw: Function

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() angle: number = 0

  @Prop() index!: number
  @Prop() element!: HatElement

  @State(state => state.editor.stage) private stage!: Coord
  @State(state => state.editor.ratio) private ratio!: number
  @Action('selectBox') private select!: (ele: HatElement) => void
  @Mutation(TYPE.CHANGE_ELE) private changeEle!: Function
  @Mutation(TYPE.UPDATE_ELE) private updateElement!: Function

  constructor () {
    super()
    this.draw = getDrawMethod(this.element.type)
  }

  render () {
    const {
      d,
      transform,
      commitState,
      element: {
        attrs: {
          x,
          y,
          width,
          height,
          rotate
        }
      }
    } = this

    return (
      <path
        d={d}
        stroke-width='5'
        stroke='#000'
        vector-effect='non-scaling-stroke'
        fill='none'
        transform={transform}
        onClick={this.onClick}
      />
    )
  }

  /**
   * path attr d
   */
  private get d (): string {
    return this.draw(this.element.attrs.d)
  }

  get transform (): string {
    return (
      `translate(${this.offset.x},${this.offset.y}) `
    )
  }

  mounted () {
    this.commitUpdate(this.element)
  }

  onClick () {
    this.select(this.element)
  }

  onMove (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    const { offset: thisOffset, stage, ratio } = this

    thisOffset.x = (e.pageX - stage.x - offset.x) / ratio
    thisOffset.y = (e.pageY - stage.y - offset.y) / ratio
  }

  onScale () {
    console.log('scale')
  }

  onRotate () {
    console.log('rotate')
  }

  onCommit () {
    this.commitState({
      offsetX: this.offset.x,
      offsetY: this.offset.y,
      scaleX: this.scale.x,
      scaleY: this.scale.y,
      rotate: this.angle
    })
    this.offset.x = 0
    this.offset.y = 0
    this.scale.x = 1
    this.scale.y = 1
    this.angle = 0
  }

  /**
   * change state function
   *
   * @param element
   * @param param1
   */
  changeState (
    element: HatElement,
    { offsetX, offsetY, scaleX, scaleY, rotate }: EleChangeStage
  ) {
    const { type, attrs } = element
    const baseNum = type === MODEL.DRAW_CIRCLE ? 2 : 1

    attrs.x += offsetX
    attrs.y += offsetY
    attrs.rotate += rotate
    // this way will not update, #https://vuejs.org/v2/guide/list.html#Caveats
    // ```
    // attrs.d.forEach((p: number[]) => {
    //   p[0] = (p[0] + offsetX - attrs.x) * scaleX + attrs.x
    //   p[1] = (p[1] + offsetY - attrs.y) * scaleY + attrs.y
    // })
    // ```
    attrs.d = attrs.d.map((p: number[], i: number) => {
      return [
        (p[0] + offsetX - attrs.x) * scaleX + attrs.x,
        (p[1] + offsetY - attrs.y) * scaleY + attrs.y
      ]
    })
    let scaleW = attrs.width * scaleX
    if (scaleX < 0) attrs.x += scaleW
    attrs.width = Math.abs(scaleW)

    let scaleH = attrs.height * scaleY
    if (scaleY < 0) attrs.y += scaleH
    attrs.height = Math.abs(scaleH)
  }

  /**
   * commit state to vuex
   *
   * @param changeState
   */
  commitState (changeState: EleChangeStage) {
    this.changeEle({
      i: this.index,
      changeState,
      change: this.changeState,
      context: this
    })
  }

  commitUpdate (ele: HatElement) {
    const newEle = copyElement(ele)
    let range: EleLocation
    switch (this.element.type) {
      case MODEL.DRAW_CIRCLE:
        range = this.getCircleRange(ele.attrs.d)
        break
      default:
        range = this.getBaseRange(ele.attrs.d)
    }
    newEle.attrs.x = range.x
    newEle.attrs.y = range.y
    newEle.attrs.width = range.width
    newEle.attrs.height = range.height
    newEle.onMove = this.onMove
    newEle.onScale = this.onScale
    newEle.onRotate = this.onRotate
    newEle.onCommit = this.onCommit

    this.updateElement(newEle)
  }

  /**
   * get range, range has x, y, width, height
   *
   * @param d
   */
  getBaseRange (d: number[][]): EleLocation {
    const minAndMax = {
      minX: window.innerWidth,
      minY: window.innerHeight,
      maxX: 0,
      maxY: 0
    }

    d.forEach(point => {
      minAndMax.minX = Math.min(point[0], minAndMax.minX)
      minAndMax.minY = Math.min(point[1], minAndMax.minY)
      minAndMax.maxX = Math.max(point[0], minAndMax.maxX)
      minAndMax.maxY = Math.max(point[1], minAndMax.maxY)
    })

    return {
      x: minAndMax.minX,
      y: minAndMax.minY,
      width: minAndMax.maxX - minAndMax.minX,
      height: minAndMax.maxY - minAndMax.minY
    }
  }

  /**
   * get circle range
   *
   * @param d
   */
  getCircleRange (d: number[][]): EleLocation {
    let center = d[0]
    let edge = d[1]
    const r = Math.sqrt(Math.pow(edge[0] - center[0], 2) + Math.pow(edge[1] - center[1], 2))

    return {
      x: center[0] - r,
      y: center[1] - r,
      width: r * 2,
      height: r * 2
    }
  }

  getBorderPath ({ x, y, width, height }: Attrs): string {
    return getRectPath({
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height
    })
  }
}
