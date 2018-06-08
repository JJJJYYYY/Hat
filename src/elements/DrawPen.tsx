import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { HatElement, Coord, EleChangeStage } from '@/type/editor'

import { copyElement } from '@/util'
import { TYPE } from '@/enum/store'
import ELEMENT from '@/enum/element'

import Box from './Box'

const POINT_R = 0.5

@Component
export default class DrawPen extends Vue {
  name = ELEMENT.DRAW_PEN

  @Prop() element!: HatElement
  @Prop() index!: number

  @Mutation(TYPE.MOVE_ELE) private moveEle!: Function

  render () {
    return (
      <Box
        x={this.element.attrs.x}
        y={this.element.attrs.y}
        width={this.element.attrs.width}
        height={this.element.attrs.height}
        rotate={this.element.attrs.rotate}
        onChange={this.commitState}>
        <path
          d={this.d}
          stroke='#000'
          vector-effect='non-scaling-stroke'
          fill='none'
          stroke-dasharray='none'>
        </path>
      </Box>
    )
  }

  get d () {
    return this.draw(this.element.attrs.d)
  }

  public draw (path: number[][]) {
    switch (path.length) {
      case 0:
        return ''
      case 1:
        return `M${path[0][0] - POINT_R} ${path[0][1]} A ${POINT_R} ${POINT_R},0,0,1,${path[0][0] - POINT_R} ${path[0][1]}`
      case 2:
        return `M${path[0][0]} ${path[0][1]} L${path[1][0]} ${path[1][1]}`
      default:
        let lastIndex = path.length - 1
        return path.reduce((d, p, i) => {
          switch (i) {
            case 0: // first point
              return `M${p[0]} ${p[1]}`
            case 1: // second point
              {
                let p1 = path[0]
                let start = [(p1[0] + p[0]) / 2, (p1[1] + p[1]) / 2]
                return `${d}  L${start[0]} ${start[1]}`
              }
            case lastIndex: // last point
              return `${d}  L${p[0]} ${p[1]}`
            default:
              {
                let p3 = path[i + 1]
                let end = [(p3[0] + p[0]) / 2, (p3[1] + p[1]) / 2]
                return `${d} Q${p[0]} ${p[1]} ${end[0]} ${end[1]}`
              }
          }
        }, '')
    }
  }

  changeState (
    element: HatElement,
    { offsetX, offsetY, scaleX, scaleY, rotate }: EleChangeStage
  ) {
    const { attrs } = element

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

  commitState (changeState: EleChangeStage) {
    console.log(this.index)
    this.moveEle({
      i: this.index,
      changeState,
      change: this.changeState,
      target: this
    })
  }
}
