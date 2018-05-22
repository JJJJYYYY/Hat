import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'

import { ElementStyle } from '@/type'

import event from '@/util/event'

@Component
export default class Stage extends Vue {
  @Provide() width = 1000
  @Provide() height = 600

  @Action private selectBox!: Function

  get cptSize (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  onClick () {
    this.selectBox()
  }
}
