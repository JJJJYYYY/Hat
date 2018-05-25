<template>
  <Box
    :x='data.attrs.x'
    :y='data.attrs.y'
    :width='data.attrs.w'
    :height='data.attrs.h'>
    <path
      :d='data.attrs.d'
      stroke='#000'
      fill="none"
      stroke-dasharray="none"
      >
    </path>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { Element } from '@/type/editor'

import Box from '../Box/index.vue'

@Component({
  components: { Box }
})
export default class DrawPath extends Vue {
  name = 'DrawPath'

  @Prop() data!: Element
}
</script>
