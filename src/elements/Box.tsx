import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
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
          v-show={this.cptSelect}
          class='box-border'
          vector-effect='non-scaling-stroke'
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          transform={this.translate}
          onMousedown={this.onMoveStart}
          >
        </rect>
        { this.$slots.default }
        <g v-show={this.cptIsSingle}
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
    // prevent repeat call `selectBox` on `onMoveStart` and `onMoveEnd`
    if (selectNum < 2 || this.multiply) {
      this.selectBox(this)
    }
    // mouse on a selected box maybe will move,
    // else it is not impossible
    if (this.cptSelect) {
      this.changeModel(MODEL.MOVE)
    }
    clickTime = Date.now()
  }

  moveBox (e: MouseEvent) {
    this.offset.x += e.movementX
    this.offset.y += e.movementY
  }

  moveEnd (e: MouseEvent) {
    // move select box when multiply model
    // if click time less 300s we think it is a click
    // and call `selectBox`
    if (this.boxIds.length > 1 &&
      Date.now() - clickTime < 300) {
      this.selectBox(this)
    }
    // this.moveEle(copyElement(this.data))
    this.$emit('moveEnd', this.offset)
    this.offset.x = 0
    this.offset.y = 0
  }

  onResizeStart (e: MouseEvent) {
    if (this.cptSelect) {
      this.changeModel(MODEL.SCALE)
      location = (e.target as HTMLElement).dataset.type || ''
    }
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
