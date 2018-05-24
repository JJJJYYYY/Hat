<template>
    <path
      :d='data.attrs.d'
      stroke='#000'
      fill="none"
      stroke-dasharray="none"
      >
    </path>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { Element } from '@/type/editor'

@Component
export default class DrawPath extends Vue {
  name = 'DrawPath'

  @Prop() data!: Element
}
</script>
