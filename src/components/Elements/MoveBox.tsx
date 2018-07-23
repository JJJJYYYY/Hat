import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/types'
import { Coord, EleBox, HatElement } from '@/types/editor'

import { noop, copyElement } from '@/util'
import event from '@/util/event'
import EditorConfig from '@/config/editor'
import { stop } from '@/util/decorator'
import ChangeEle from '@/minix/ChangeEle'

@Component
export default class MoveBox extends ChangeEle {
  name = 'MoveBox'

  @Mutation(TYPE.ELE_OFFSET) private moveEle!: (offset: Coord) => void
  // @Action('selectBox') private select!: (ele: HatElement) => void

  render (): VNode {
    const {
      onMousedown,
      onMouseup,
      transform,
      editThis,
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
      <rect
        class='box-border selected'
        vector-effect='non-scaling-stroke'
        x={x}
        y={y}
        width={width}
        height={height}
        transform={transform}
        onMousedown={onMousedown}
        onMouseup={onMouseup}
        onDblclick={editThis.bind(this)}
      ></rect>
    )
  }

  mounted () {
    this.commitUpdate(this.element)
  }

  commitUpdate (ele: HatElement) {
    const newEle = copyElement(ele)
    newEle.onMove = this.onMove

    this.updateElement(newEle)
  }

  onMousedown () {
    this.changeModel(MODEL.MOVE)
    this.selectThis()
  }

  onMouseup () {
    // private onDragUp model === NONE
    // this.$nextTick(() => this.changeModel(MODEL.NONE))
  }

  onMove (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    const { stage, ratio, moveEle } = this

    moveEle({
      x: (e.pageX - stage.x - offset.x) / ratio,
      y: (e.pageY - stage.y - offset.y) / ratio
    })
  }
}
