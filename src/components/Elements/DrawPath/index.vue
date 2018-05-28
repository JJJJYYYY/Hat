<template>
  <Box
    :x='element.attrs.x'
    :y='element.attrs.y'
    :width='element.attrs.width'
    :height='element.attrs.height'
    @moveEnd='moveEnd'>
    <path
      :d='element.attrs.d'
      stroke='#000'
      fill="none"
      stroke-dasharray="none"
      >
    </path>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { IndexElement, Coord } from '@/type/editor'

import { copyElement } from '@/util'
import { TYPE } from '@/enum/store'

import Box from '../Box/index.vue'

@Component({
  components: { Box }
})
export default class DrawPath extends Vue {
  name = 'DrawPath'

  @Prop() element!: IndexElement

  @Mutation(TYPE.MOVE_ELE) private moveEle!: Function

  moveEnd ({ x, y }: Coord) {
    let newEle = copyElement(this.element)
    let i = 0
    newEle.attrs.d = newEle.attrs.d.replace(/-?\d{1,}(\.\d{1,})?/g, (m: string) => {
      return +m + (i++ % 2 === 0 ? x : y)
    })
    newEle.attrs.x += x
    newEle.attrs.y += y
    this.moveEle(newEle)
  }
}
</script>
