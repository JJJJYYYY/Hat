import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/type'
import { Coord, EleBox } from '@/type/editor'
import event from '@/util/event'
import EditorConfig from '@/config/editor'
import { stop } from '@/util/decorator'

const { min: ELE_MIN } = EditorConfig.element.size
const PADDING = 20
const ROTATE_POINT_TOP = 20
const ROTATE_POINT_R = 6

let uid = 0

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

  dir?: string
  boxId = ++uid
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

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() spin: number = 0
  @Provide() lock = false

  @State(state => state.editor.multiply) private multiply!: boolean
  @State(state => state.editor.boxIds) private boxIds!: number[]
  @State(state => state.editor.stage) private stage!: Coord
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.MOVE_ELE) private moveEle!: Function
  @Action('selectBox') private select!: Function

  render () {
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
        transform={this.transform}
        onMousedown={this.onMousedown}
        onMouseup={this.onMouseup}
        >
        <circle
          class='rotate-point'
          vector-effect='non-scaling-stroke'
          v-show={this.selected}
          r={ROTATE_POINT_R}
          cx={this.rotatePoint.x}
          cy={this.rotatePoint.y}
          onMousedown={this.onRotateStart}
        ></circle>
        <path
          d={this.lineTop}
        ></path>
        <rect
          class={`box-border ${this.selected ? 'selected' : ''}`}
          vector-effect='non-scaling-stroke'
          ref='svgBox'
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          transform={this.translate}
        ></rect>
        <g
          transform={this.translate}
        >
          { this.$slots.default }
        </g>
        <g
          v-show={this.isSingle}
          >
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
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 }
  }

  get scalePoint (): Coord[] {
    let x = this.x
    let y = this.y
    let width = this.width * this.scale.x
    let height = this.height * this.scale.y
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
    return `translate(${this.x},${this.y}) scale(${this.scale.x},${this.scale.y}) translate(${-this.x},${-this.y})`
  }

  get rotatePoint (): Coord {
    return {
      x: this.centerPoint.x,
      y: this.y - ROTATE_POINT_TOP
    }
  }

  get lineTop (): string {
    return `M${this.rotatePoint.x} ${this.rotatePoint.y + ROTATE_POINT_R / 2} L${this.rotatePoint.x} ${this.y}`
  }

  get rotateAngle (): number {
    return (this.rotate || 0) + this.spin
  }

  get transform (): string {
    return `translate(${this.offset.x},${this.offset.y}) rotate(${this.rotateAngle} ${this.centerPoint.x} ${this.centerPoint.y})`
  }

  onMousedown () {
    let selected = this.selected
    selectNum = this.boxIds.length
    if ((selectNum < 2 && !selected) || this.multiply) this.select(this)
    // mouse on a selected box maybe will move,
    // else it is not impossible
    if (selected || this.isSingle) this.changeModel(MODEL.MOVE)
    clickTime = Date.now()
  }

  onMouseup (e: MouseEvent) {
    if (selectNum > 1 &&
      this.boxIds.length === selectNum && // prevent repeat call `selectBox`
      Date.now() - clickTime < 300 // simulate click
    ) {
      this.select(this)
    }
  }

  [MODEL.MOVE] (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    this.offset.x = e.pageX - this.stage.x - offset.x
    this.offset.y = e.pageY - this.stage.y - offset.y
  }

  [`${MODEL.MOVE}End`] (e: MouseEvent) {
    this.commitState()
  }

  @stop
  onScaleStart (dir: string, e: MouseEvent) {
    this.dir = dir
    this.changeModel(MODEL.SCALE)
  }

  [MODEL.SCALE] (e: MouseEvent, startPoint: Coord) {
    (this.dir || '').split('-').forEach(l => {
      switch (l) {
        case DIR.LEFT:
          let diffX = this.stage.x + this.x - e.pageX
          this.scale.x = diffX / this.width + 1
          this.offset.x = -diffX
          break
        case DIR.TOP:
          let diffY = this.stage.y + this.y - e.pageY
          this.scale.y = diffY / this.height + 1
          this.offset.y = -diffY
          break
        case DIR.RIGHT:
          this.scale.x = (e.pageX - this.stage.x - this.x) / this.width
          break
        case DIR.BOTTOM:
          this.scale.y = (e.pageY - this.stage.y - this.y) / this.height
          break
      }
    })
  }

  [`${MODEL.SCALE}End`] () {
    this.commitState()
  }

  @stop
  onRotateStart () {
    this.changeModel(MODEL.ROTATE)
  }

  [MODEL.ROTATE] (e: MouseEvent, startPoint: Coord) {
    this.spin++
  }

  [`${MODEL.ROTATE}End`] () {
    console.log('rotate end')
    this.changeModel(MODEL.NONE)
  }

  commitState () {
    this.changeModel(MODEL.NONE)

    this.$emit('change', {
      offsetX: this.offset.x,
      offsetY: this.offset.y,
      scaleX: this.scale.x,
      scaleY: this.scale.y
    })
    this.offset.x = 0
    this.offset.y = 0
    this.scale.x = 1
    this.scale.y = 1
  }
}
