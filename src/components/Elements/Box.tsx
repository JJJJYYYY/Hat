import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/types'
import { Coord, EleBox } from '@/types/editor'

import { noop } from '@/util'
import event from '@/util/event'
import EditorConfig from '@/config/editor'
import { stop } from '@/util/decorator'

// const { min: ELE_MIN } = EditorConfig.element.size
// const PADDING = 20
const ROTATE_POINT_TOP = 20
const ROTATE_POINT_R = 6

let clickTime = 0
let selectNum = 0

enum DIR {
  LEFT = 'l',
  TOP = 't',
  RIGHT = 'r',
  BOTTOM = 'b'
}

@Component
export default class Box extends Vue {
  name = 'Box'

  dir: string = ''
  boxId = 0
  points: string[] = [
    `${DIR.LEFT}-${DIR.BOTTOM}`,
    `${DIR.LEFT}`,
    `${DIR.LEFT}-${DIR.TOP}`,
    `${DIR.TOP}`,
    `${DIR.RIGHT}-${DIR.TOP}`,
    `${DIR.RIGHT}`,
    `${DIR.RIGHT}-${DIR.BOTTOM}`,
    `${DIR.BOTTOM}`
  ]

  @Prop() x!: number
  @Prop() y!: number
  @Prop() width!: number
  @Prop() height!: number
  @Prop() rotate!: number
  @Prop() scaling?: Function

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() angle: number = 0
  @Provide() lock = false

  @State(state => state.editor.model) private model!: string
  @State(state => state.editor.ratio) private ratio!: number
  @State(state => state.editor.multiply) private multiply!: boolean
  @State(state => state.editor.boxIds) private boxIds!: number[]
  @State(state => state.editor.stage) private stage!: Coord
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: (model: string) => void
  @Action('selectBox') private select!: (ele: EleBox) => void

  render (): VNode {
    const scalePoints = this.points.map((p, i) => {
      return (
        <circle
          r='4'
          vector-effect='non-scaling-stroke'
          key={i}
          cx={this.scalePoint[i].x}
          cy={this.scalePoint[i].y}
          data-type={p}
          class={ `box-point ${p}`}
          onMousedown={this.onScaleStart.bind(this, p)}
        ></circle>
      )
    })

    return (
      <g
        stroke={this.boxBorder}
        onDblclick={this.selectThis}
        onMousedown={this.onMousedown}
        onMouseup={this.onMouseup}
        transform={this.transform}
      >
        <g
          transform={this.translate}
        >
          <rect
            class={`box-border ${this.selected ? 'selected' : ''}`}
            vector-effect='non-scaling-stroke'
            x={this.x}
            y={this.y}
            width={this.width}
            height={this.height}
          ></rect>
          { this.$slots.default }
        </g>
        <g
          v-show={this.selected && this.isSingle}
        >
          <circle
            class='rotate-point'
            vector-effect='non-scaling-stroke'
            r={ROTATE_POINT_R}
            cx={this.rotatePoint.x}
            cy={this.rotatePoint.y}
            onMousedown={this.onRotateStart}
          ></circle>
          <line
            x1={this.rotatePoint.x}
            y1={this.rotatePoint.y}
            x2={this.rotatePoint.x}
            y2={this.y}
          ></line>
          { scalePoints }
        </g>
      </g>
    )
  }

  get selected (): boolean {
    return this.boxIds.includes(this.boxId)
  }

  get boxBorder (): string {
    return this.lock ? 'red' : (this.selected ? 'blue' : '')
  }

  get isSingle (): boolean {
    return this.selected && this.boxIds.length === 1
  }

  get centerPoint (): Coord {
    return { x: this.x + this.width * this.scale.x / 2, y: this.y + this.height * this.scale.y / 2 }
  }

  get scalePoint (): Coord[] {
    const x = this.x
    const y = this.y
    const width = this.width * this.scale.x
    const height = this.height * this.scale.y

    return this.points.map(p => {
      let l: Coord = {
        x: this.centerPoint.x,
        y: this.centerPoint.y
      }

      p.split('-').map(dir => {
        switch (dir) {
          case DIR.LEFT:
            l.x = x
            break
          case DIR.TOP:
            l.y = y
            break
          case DIR.RIGHT:
            l.x = x + width
            break
          case DIR.BOTTOM:
            l.y = y + height
            break
        }
      })

      return l
    })
  }

  get translate (): string { // Q: why is work?
    return (
      `translate(${this.x},${this.y}) ` +
      `scale(${this.scale.x},${this.scale.y}) ` +
      `translate(${-this.x},${-this.y})`
    )
  }

  get rotatePoint (): Coord {
    return {
      x: this.centerPoint.x,
      y: this.y - ROTATE_POINT_TOP
    }
  }

  get rotateAngle (): number {
    return this.rotate + this.angle
  }

  get transform (): string {
    return (
      `translate(${this.offset.x},${this.offset.y}) ` +
      `rotate(${this.rotateAngle} ${this.centerPoint.x} ${this.centerPoint.y})`
    )
  }

  get isModelNone () {
    return this.model === MODEL.NONE
  }

  onMousedown () {
    let selected = this.selected
    selectNum = this.boxIds.length
    if (
      (selectNum < 2 && !selected) ||
      this.multiply
    ) {
      this.select(this)
    }
    // mouse on a selected box maybe will move,
    // else it is not impossible
    if (selected || this.isSingle) this.changeModel(MODEL.MOVE)
    clickTime = Date.now()
  }

  onMouseup () {
    if (
      selectNum > 1 &&
      this.boxIds.length === selectNum && // prevent repeat call `selectBox`
      Date.now() - clickTime < 300 // simulate click
    ) {
      this.select(this)
    }
  }

  [MODEL.MOVE] (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    this.offset.x = (e.pageX - this.stage.x - offset.x) / this.ratio
    this.offset.y = (e.pageY - this.stage.y - offset.y) / this.ratio
  }

  @stop
  onScaleStart (dir: string, e: MouseEvent) {
    this.dir = dir
    this.changeModel(MODEL.SCALE)
  }

  [MODEL.SCALE] (e: MouseEvent) {
    const { scaling, dir, scale, offset, stage, x, y, width, height } = this
    if (scaling) {
      if (!scaling(dir, scale, offset)) return
    }
    dir.split('-').forEach(l => {
      switch (l) {
        case DIR.LEFT:
          let diffX = stage.x + x - e.pageX
          scale.x = diffX / width + 1
          offset.x = -diffX
          break
        case DIR.TOP:
          let diffY = stage.y + y - e.pageY
          scale.y = diffY / height + 1
          offset.y = -diffY
          break
        case DIR.RIGHT:
          scale.x = (e.pageX - stage.x - x) / width
          break
        case DIR.BOTTOM:
          scale.y = (e.pageY - stage.y - y) / height
          break
      }
    })
  }

  @stop
  onRotateStart () {
    this.changeModel(MODEL.ROTATE)
  }

  [MODEL.ROTATE] (e: MouseEvent, startPoint: Coord) {
    const { x, y } = this.centerPoint
    const { offsetX: x1, offsetY: y1 } = e // todo：(y1 - y) / (x1 - x)
    this.angle = Math.atan2(x1 - x, y - y1) / Math.PI * 180 - this.rotate
  }

  selectThis () {
    this.select(this)
  }

  commit () {
    this.changeModel(MODEL.NONE)

    this.$emit('change', {
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

  afterRotate (angle: number) {
    angle = this.rotate + angle
  }
}
