<template>
  <div class="box"
    @mousedown="onMoveStart"
    :style="cptBoxSize"
    :class="{ moving: this.moving.length }">
    <i v-for="(p, i) in points" :key="i" v-once
      class="point" :class="p" :data-type='p'
      @mousedown.stop="onResizeStart"
      ></i>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'

import { ElementStyle } from '@/type'

import event from '@/util/event'

import EditorConfig from '@/config/editor'

const { min: ELE_MIN } = EditorConfig.element.size

@Component
export default class Box extends Vue {
  @Prop() stage?: Element

  @Provide() top = 100
  @Provide() left = 100
  @Provide() width = 300
  @Provide() height = 200
  @Provide() moving: number[] = []
  @Provide() resizing: string[] = []
  @Provide() points: string[] = [
    'l-b', 'l', 'l-t', 't', 'r-t', 'r', 'r-b', 'b'
  ]


  @Watch('width')
  onWidthChange (val: number) {
    if (val < ELE_MIN) this.width = ELE_MIN
  }

  @Watch('height')
  onHeightChange (val: number) {
    if (val < ELE_MIN) this.height = ELE_MIN
  }

  get cptBoxSize (): ElementStyle {
    const self = this as any

    return {
      top: `${self.top}px`,
      left: `${self.left}px`,
      width: `${self.width}px`,
      height: `${self.height}px`
    }
  }

  onMoveStart (e: MouseEvent) {
    this.moving = [e.offsetX, e.offsetY]
    event.$on('mousemove', this.onMove)
    event.$once('mouseup', this.onMoveEnd)
  }

  onMove (e: MouseEvent) {
    if (this.moving.length) {
      const { offsetTop, offsetLeft } = this.$parent.$el

      this.top = e.clientY - (offsetTop - 300) - this.moving[1]
      this.left = e.clientX - (offsetLeft - 500) - this.moving[0]
    }
  }

  onMoveEnd () {
    this.moving = []
    event.$off('mousemove', this.onMove)
    event.$off('mouseup', this.onMoveEnd)
  }

  onResizeStart (e: MouseEvent) {
    this.resizing = ((e.target as HTMLElement).dataset.type || '').split('-')
    event.$on('mousemove', this.onResize)
    event.$once('mouseup', this.onResizeEnd)
  }

  onResize (e: MouseEvent) {
    const { offsetLeft, offsetTop } = this.$parent.$el

    this.resizing.forEach(location => {
      switch (location) {
        case 'l':
          let left = e.clientX - (offsetLeft - 500)
          this.width += this.left - left
          this.left = left
          break
        case 't':
          let top = e.clientY - (offsetTop - 300)
          this.height += this.top - top
          this.top = top
          break
        case 'r':
          this.width = e.clientX - (offsetLeft - 500) - this.left
          break
        case 'b':
          this.height = e.clientY - (offsetTop - 300) - this.top
          break
      }
    })
  }

  onResizeEnd () {
    this.resizing = []
    event.$off('mousemove', this.onResize)
    event.$off('mouseup', this.onResizeEnd)
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
  @size: 8px;
  @border: 2px;

  display: inline-block;
  position: absolute;
  width: @size;
  height: @size;
  border: @border solid @primary;
  border-radius: 50%;
  background: #ddd;

  @dis: @size / 2 + @border + @box-border / 2;

  &.l {
    top: 50%;
    left: -@dis;
    margin-top: -@dis;
    cursor: ew-resize;
  }

  &.l-t {
    left: -@dis;
    top: -@dis;
    cursor: nwse-resize;
  }

  &.t {
    top: -@dis;
    left: 50%;
    margin-left: -@dis;
    cursor: ns-resize;
  }

  &.r-t {
    top: -@dis;
    right: -@dis;
    cursor: nesw-resize;
  }

  &.r {
    top: 50%;
    right: -@dis;
    margin-top: -@dis;
    cursor: ew-resize;
  }

  &.r-b {
    bottom: -@dis;
    right: -@dis;
    cursor: nwse-resize;
  }

  &.b {
    bottom: -@dis;
    left: 50%;
    margin-left: -@dis;
    cursor: ns-resize;
  }

  &.l-b {
    bottom: -@dis;
    left: -@dis;
    cursor: nesw-resize;
  }
}
</style>

