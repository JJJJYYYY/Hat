import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { HatElement, Coord } from '@/type/editor'

import { copyElement } from '@/util'
import { TYPE } from '@/enum/store'

import Box from './Box'

@Component
export default class DrawPath extends Vue {
  name = 'DrawPath'

  @Prop() element!: HatElement

  @Mutation(TYPE.CHANGE_ELE) private changeEle!: Function

  render (): VNode {
    return (
      <Box
        x={this.element.attrs.x}
        y={this.element.attrs.y}
        width={this.element.attrs.width}
        height={this.element.attrs.height}
      >
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
    let newEle = copyElement<HatElement>(this.element)
    let i = 0
    newEle.attrs.d = newEle.attrs.d.replace(/-?\d{1,}(\.\d{1,})?/g, (m: string) => {
      return +m + (i++ % 2 === 0 ? x : y)
    })
    newEle.attrs.x += x
    newEle.attrs.y += y
    this.changeEle(newEle)
  }
}
