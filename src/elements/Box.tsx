import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/type'
import { Coord, IndexElement } from '@/type/editor'
import event from '@/util/event'
import EditorConfig from '@/config/editor'

const { min: ELE_MIN } = EditorConfig.element.size

let uid = 0

let clickTime = 0
let selectNum = 0
let location = ''

enum DIR {
  LEFT = 'l',
  TOP = 't',
  RIGHT = 'r',
  BOTTOM = 'b'
}

@Component
export default class Box extends Vue {
  name = 'Box'
  startPoint: Coord = { x: 0, y: 0 }

  @Prop() x!: number
  @Prop() y!: number
  @Prop() width!: number
  @Prop() height!: number

  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() lock = false

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

  @State(state => state.editor.multiply) private multiply!: boolean
  @State(state => state.editor.boxIds) private boxIds!: number[]
  @State(state => state.editor.stage) private stage!: Coord
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.MOVE_ELE) private moveEle!: Function
  @Action private selectBox!: Function

  render () {
    const scalePoints = this.points.map((p, i) => {
      return (
        <circle
          r='4'
          vector-effect='non-scaling-stroke'
          key={i}
          cx={this.cptPoint[i].x}
          cy={this.cptPoint[i].y}
          data-type={p}
          class={ `box-point ${p}`}
          onMousedown={this.onResizeStart}
        ></circle>
      )
    })

    return (
      <g
        stroke={this.cptBoxBorder}
        transform={`translate(${this.offset.x},${this.offset.y})`}
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
          onMousedown={this.onMoveStart}
          >
        </rect>
        { this.$slots.default }
        <g
          transform={this.translate}
          >
          { scalePoints }
        </g>
      </g>
    )
  }

  get cptSelect (): boolean {
    return this.boxIds.includes(this.boxId)
  }

  get cptBoxBorder (): string {
    return this.lock ? 'red' : (this.cptSelect ? 'blue' : '')
  }

  get cptIsSingle (): boolean {
    return this.cptSelect && this.boxIds.length === 1
  }

  get cptPoint (): Coord[] {
    return this.points.map(p => {
      let l: Coord = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
      }

      p.split('-').map(dir => {
        switch (dir) {
          case DIR.LEFT:
            l.x = this.x
            break
          case DIR.TOP:
            l.y = this.y
            break
          case DIR.RIGHT:
            l.x = this.x + this.width
            break
          case DIR.BOTTOM:
            l.y = this.y + this.height
            break
        }
      })

      return l
    })
  }

  get translate (): string {
    return `
      translate(${this.x},${this.y})
      scale(${this.scale.x},${this.scale.y})
      translate(${-this.x},${-this.y})
    `
  }

  onMoveStart (e: MouseEvent) {
    this.changeModel(MODEL.MOVE)

    event.$on(MODEL.MOVE, this.onMove)
    event.$once(MODEL.NONE, this.onMoveEnd)

    this.startPoint.x = e.offsetX - this.offset.x
    this.startPoint.y = e.offsetY - this.offset.y
    e.stopPropagation()
  }

  onMove (e: MouseEvent) {
    this.offset.x = e.pageX - this.stage.x - this.startPoint.x
    this.offset.y = e.pageY - this.stage.y - this.startPoint.y
  }

  onMoveEnd (e: MouseEvent) {
    event.$off(MODEL.MOVE, this.onMove)
  }

  onResizeStart (e: MouseEvent) {
    console.log(e)
  }

  scaleBox (e: MouseEvent) {
    location.split('-').forEach(l => {
      switch (l) {
        case DIR.LEFT:
          // this.width -= e.movementX
          this.scale.x += e.movementX / 300
          break
        case DIR.TOP:
          // this.height -= e.movementY
          this.scale.y += e.movementY / 200
          break
        case DIR.RIGHT:
          this.scale.x += e.movementX / 300
          break
        case DIR.BOTTOM:
          this.scale.y += e.movementY / 200
          break
      }
    })
  }
}
