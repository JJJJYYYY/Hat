import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/type'
import { Coord, IndexElement, EleBox } from '@/type/editor'
import event from '@/util/event'
import EditorConfig from '@/config/editor'

const { min: ELE_MIN } = EditorConfig.element.size

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

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
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
        transform={`translate(${this.offset.x},${this.offset.y})`}
        onMousedown={this.onMousedown}
        onMouseup={this.onMouseup}
        >
        <rect
          class='box-border'
          vector-effect='non-scaling-stroke'
          ref='svgBox'
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          transform={this.translate}
          >
        </rect>
        <g
          transform={this.translate}>
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

  get scalePoint (): Coord[] {
    let x = this.x
    let y = this.y
    let width = this.width * this.scale.x
    let height = this.height * this.scale.y
    return this.points.map(p => {
      let l: Coord = {
        x: this.x + width / 2,
        y: this.y + height / 2
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

  onMousedown () {
    console.log()
    let selected = this.selected
    selectNum = this.boxIds.length
    // prevent repeat call `selectBox` on `onMoveStart` and `onMoveEnd`
    if ((selectNum < 2 && !selected) || this.multiply) this.select(this)
    // mouse on a selected box maybe will move,
    // else it is not impossible
    if (selected || this.isSingle) this.changeModel(MODEL.MOVE)
    clickTime = Date.now()
  }

  onMouseup (e: MouseEvent) {
    // simulate click
    if (selectNum > 1 && Date.now() - clickTime < 300) this.select(this)
  }

  [MODEL.MOVE] (e: MouseEvent, offset: Coord = { x: 0, y: 0 }) {
    this.offset.x = e.pageX - this.stage.x - offset.x
    this.offset.y = e.pageY - this.stage.y - offset.y
  }

  [`${MODEL.MOVE}End`] (e: MouseEvent) {
    this.changeModel(MODEL.NONE)
    this.offset.x = 0
    this.offset.y = 0
  }

  onScaleStart (dir: string, e: MouseEvent) {
    this.dir = dir
    this.changeModel(MODEL.SCALE)
    e.stopPropagation()
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
    this.changeModel(MODEL.NONE)
    this.offset.x = 0
    this.offset.y = 0
    this.scale.x = 1
    this.scale.y = 1
  }
}
