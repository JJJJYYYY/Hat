import Vue from 'vue'
import { State, Getter, Mutation } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'

import { KEY_CODE } from '@/enum/common'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import Stage from '@/components/Stage/index.vue'
import Box from '@/components/elements/Box/index.vue'

import event from '@/util/event'

import { ElementStyle } from '@/type'

@Component({
  components: {
    Stage,
    Box
  }
})
export default class Editor extends Vue {
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Getter getBoxes!: any
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.PRESS_MULTIPLY) private pressMultiply!: Function

  get cptFullSize (): ElementStyle {
    return {
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      background: `${'#eee'}`
    }
  }

  get MODEL_PEN (): string {
    return MODEL.PEN
  }

  onKeydown (e: KeyboardEvent) {
    switch (e.keyCode) {
      case KEY_CODE.MULTIPLY:
        this.pressMultiply(true)
        break
    }
  }

  onKeyup (e: KeyboardEvent) {
    switch (e.keyCode) {
      case KEY_CODE.MULTIPLY:
        this.pressMultiply(false)
        break
    }
  }

  onChangeModel (model: string, active: boolean) {
    active ? this.changeModel(model)
      : this.changeNotActiveModel(model)
  }

  onMousedown (e: MouseEvent) {
    if (this.notActiveModel) this.changeModel(this.notActiveModel)
    switch (this.model) {
      default:
        event.$emit('mousedown', e)
    }
  }

  onMousemove (e: MouseEvent) {
    switch (this.model) {
      case MODEL.MOVE:
        this.getBoxes.forEach((box: any) => {
          box.moveBox(e)
        })
        break
      case MODEL.SCALE:
        this.getBoxes.forEach((box: any) => {
          box.scaleBox(e)
        })
        break
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.MOVE:
        this.getBoxes.forEach((box: any) => {
          box.moveEnd(e)
        })
        break
      default:
        return
    }

    this.changeModel(MODEL.NONE)
    event.$emit(MODEL.NONE, e)
  }

  onMouseout (e: MouseEvent) {
    // todo
  }
}
