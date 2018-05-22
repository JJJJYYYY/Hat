import Vue from 'vue'
import { State, Getter, Mutation } from 'vuex-class'
import Component from 'vue-class-component'

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
  @Getter getBoxes!: any
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.PRESS_MULTIPLY) private pressMultiply!: Function

  get cptFullSize (): ElementStyle {
    return {
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      background: `${'#eee'}`
    }
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

  onMousedown (e: MouseEvent) {
    event.$emit('mousedown', e)
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
    if (this.model === MODEL.MOVE) {
      this.getBoxes.forEach((box: any) => {
        box.moveEnd(e)
      })
    }
    this.changeModel(MODEL.NONE)
    event.$emit(MODEL.NONE, e)
  }

  onMouseout (e: MouseEvent) {
    // todo
  }
}
