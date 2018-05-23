import Vue from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'

import { ElementStyle } from '@/type'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import event from '@/util/event'

@Component
export default class Stage extends Vue {
  @Provide() width = 1000
  @Provide() height = 600
  @Provide() drawPath: number[][] = []

  @State(state => state.editor.model) model!: string
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Action private selectBox!: Function

  get cptSize (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  get realDrawPath (): string {
    return this.drawPath.length ? 'M' + this.drawPath.join(' L') : ''
  }

  onClick () {
    this.selectBox()
  }

  onMousedown (e: MouseEvent) {
    if (this.notActiveModel) this.changeModel(this.notActiveModel)
    switch (this.model) {
      case MODEL.PEN:
        this.drawPath.push([e.offsetX, e.offsetY])
        break
    }
  }

  onMousemove (e: MouseEvent) {
    switch (this.model) {
      case MODEL.PEN:
        this.drawPath.push([e.offsetX, e.offsetY])
        break
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.PEN:
        this.drawPath.push([e.offsetX, e.offsetY])
        // todo: commit path to store and render element
        this.drawPath = []
        break
    }

    this.changeModel(MODEL.NONE)
    event.$emit(MODEL.NONE, e)
  }
}
