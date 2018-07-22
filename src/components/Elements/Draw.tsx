import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'

import { HatElement, Coord, Attrs, EleChangeStage, EleLocation } from '@/types/editor'
import { copyElement, noop } from '@/util'
import getDrawMethod, { getRectPath, changeState } from '@/util/draw'
import { TYPE } from '@/enum/store'

import Box from './Box'
import DrawPath from './DrawPath'
import { MODEL } from '@/enum/editor'
import ChangeEle from '@/minix/ChangeEle'

@Component
export default class DrawPen extends ChangeEle {
  name = 'Draw'

  draw: Function

  @Prop() index!: number

  @State(state => state.editor.selectedElements) private selectedElements!: HatElement[]
  @Mutation(TYPE.CHANGE_ELE) private changeEle!: Function

  constructor () {
    super()
    this.draw = getDrawMethod(this.element.type)
  }

  render () {
    const {
      d,
      trans,
      commitState,
      element: {
        attrs: {
          x,
          y,
          width,
          height,
          rotate
        }
      },
      selectThis,
      editThis
    } = this

    return (
      <path
        d={d}
        stroke-width='5'
        stroke='#000'
        vector-effect='non-scaling-stroke'
        fill='none'
        transform={trans}
        onMousedown={selectThis.bind(this)}
        onDblclick={editThis.bind(this)}
      />
    )
  }

  /**
   * path attr d
   */
  private get d (): string {
    return this.draw(this.element.attrs.d)
  }

  private get selected (): boolean {
    return this.selectedElements.includes(this.element)
  }

  private get elementAngle (): string {
    return `rotate(${this.element.attrs.rotate} ${this.centerPoint.x} ${this.centerPoint.y})`
  }

  private get trans (): string {
    return this.selected ? this.transform : this.elementAngle
  }

  mounted () {
    this.commitUpdate(this.element)
  }

  onCommit (offset: Coord, scale: Coord, angle: number) {
    this.changeEle({
      i: this.index,
      changeState: {
        offsetX: offset.x,
        offsetY: offset.y,
        scaleX: scale.x,
        scaleY: scale.y,
        rotate: angle
      },
      change: changeState,
      context: this
    })
  }

  /**
   * commit state to vuex
   *
   * @param changeState
   */
  commitState (changeState: EleChangeStage) {
    //
  }

  commitUpdate (ele: HatElement) {
    // TODO: try to be better, ex: not copy `d`
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
    newEle.onCommit = this.onCommit.bind(this)

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
