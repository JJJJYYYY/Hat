import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/types'
import { Coord, EleBox, HatElement } from '@/types/editor'

import { noop } from '@/util'
import event from '@/util/event'
import EditorConfig from '@/config/editor'
import { stop } from '@/util/decorator'

@Component
export default class MoveBox extends Vue {
  name = 'MoveBox'

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() angle: number = 0

  @Prop() element!: HatElement
  @State(state => state.editor.stage) private stage!: Coord
  @State(state => state.editor.ratio) private ratio!: number
  // @Action('selectBox') private select!: (ele: HatElement) => void

  render (): VNode {
    const {
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
      ></rect>
    )
  }

  [MODEL.MOVE] (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    const { offset: thisOffset, stage, ratio } = this

    thisOffset.x = (e.pageX - stage.x - offset.x) / ratio
    thisOffset.y = (e.pageY - stage.y - offset.y) / ratio
  }
}
