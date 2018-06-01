import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { IndexElement, Coord } from '@/type/editor'

import { copyElement } from '@/util'
import { TYPE } from '@/enum/store'
import ELEMENT from '@/enum/element'

import Box from './Box'

@Component
export default class DrawPen extends Vue {
  name = ELEMENT.DRAW_PEN

  @Prop() element!: IndexElement

  @Mutation(TYPE.MOVE_ELE) private moveEle!: Function

  render () {
    return (
      <Box
        x={this.element.attrs.x}
        y={this.element.attrs.y}
        width={this.element.attrs.width}
        height={this.element.attrs.height}
        onMoveEnd={this.moveEnd}>
        <path
          d={this.element.attrs.d}
          stroke='#000'
          fill='none'
          stroke-dasharray='none'>
        </path>
      </Box>
    )
  }

  moveEnd ({ x, y }: Coord) {
    let newEle = copyElement(this.element)
    let i = 0
    newEle.attrs.d = newEle.attrs.d.replace(/-?\d{1,}(\.\d{1,})?/g, (m: string) => {
      return +m + (i++ % 2 === 0 ? x : y)
    })
    newEle.attrs.x += x
    newEle.attrs.y += y
    this.moveEle(newEle)
  }
}
