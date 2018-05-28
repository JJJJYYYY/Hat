<template>
  <g
    :stroke="cptBoxBorder"
    :transform='`translate(${offset.x},${offset.y})`'>
    <rect
      stroke-width='1'
      fill='transparent'
      vector-effect='non-scaling-stroke'
      :x='x'
      :y='y'
      :width='width'
      :height='height'
      :transform='`translate(${x},${y}) scale(${scale.x},${scale.y}) translate(${-x},${-y})`'
      @mousedown="onMoveStart"
      >
    </rect>
    <slot></slot>
    <g v-show="cptIsSingle"
      :transform='`translate(${x},${y}) scale(${scale.x},${scale.y}) translate(${-x},${-y})`'>
      <circle
        r='4'
        fill='#fff'
        class="point"
        vector-effect='non-scaling-stroke'
        v-for="(p, i) in points"
        :key="i"
        :cx='cptPoint[i].x'
        :cy='cptPoint[i].y'
        :data-type='p'
        :class="p"
        @mousedown.stop="onResizeStart"
        ></circle>
    </g>
  </g>
</template>

<script lang="ts">
import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'

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

  @Provide() boxId = ++uid
  @Provide() scale: Coord = { x: 1, y: 1 }
  @Provide() lock = false
  @Provide() offset: Coord = { x: 0, y: 0 }
  @Provide() points: string[] = [
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

  onMoveStart (e: MouseEvent) {
    // prevent repeat call `selectBox` on `onMoveStart` and `onMoveEnd`
    if (selectNum < 2 || this.multiply) {
      this.selectBox(this)
    }
    // mouse on a selected box maybe will move,
    // else it is't impossible
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
</script>

<style lang="less" scoped>
@import url(~@/base.less);

@box-border: 1px;

.box {
  position: absolute;
  width: 300px;
  height: 200px;
  border: @box-border solid @primary;

  &.moving {
    cursor: move;
  }
}

.point {
  &.l {
    cursor: ew-resize;
  }

  &.l-t {
    cursor: nwse-resize;
  }

  &.t {
    cursor: ns-resize;
  }

  &.r-t {
    cursor: nesw-resize;
  }

  &.r {
    cursor: ew-resize;
  }

  &.r-b {
    cursor: nwse-resize;
  }

  &.b {
    cursor: ns-resize;
  }

  &.l-b {
    cursor: nesw-resize;
  }
}
</style>

