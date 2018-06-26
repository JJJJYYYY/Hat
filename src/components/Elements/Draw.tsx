import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'

import { HatElement, Coord, EleChangeStage, EleLocation } from '@/type/editor'

import { copyElement, noop } from '@/util'
import getDrawMethod from '@/util/draw'
import { TYPE } from '@/enum/store'

import Box from './Box'
import Path from './Path'
import { MODEL } from '@/enum/editor'

@Component
export default class DrawPen extends Vue {
  name = 'Draw'

  draw: Function

  @Prop() element!: HatElement
  @Prop() index!: number

  @Mutation(TYPE.CHANGE_ELE) private changeEle!: Function
  @Mutation(TYPE.CHANGE_ELE_LOC) private changeEleLoc!: Function

  constructor () {
    super()
    this.draw = getDrawMethod(this.element.type)
  }

  render () {
    const { x, y, width, height, rotate } = this.element.attrs

    return (
      <Box
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
        scaling={this.scaling}
        onChange={this.commitState}>
        <Path
          d={this.d}
        />
      </Box>
    )
  }

  /**
   * path attr d
   */
  private get d (): string {
    return this.draw(this.element.attrs.d)
  }

  mounted () {
    this.commitLocation(this.element.attrs.d)
  }

  scaling (dir: string, scale: Coord, offset: Coord): boolean {
    // switch (this.element.type) {
    //   case MODEL.DRAW_CIRCLE:
    //     return true
    //   default:
    //     return true
    // }
    return true
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

  commitLocation (d: number[][]) {
    let range: EleLocation
    switch (this.element.type) {
      case MODEL.DRAW_CIRCLE:
        range = this.getCircleRange(d)
        break
      default:
        range = this.getBaseRange(d)
    }

    range.i = this.index
    this.changeEleLoc(range)
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
}
