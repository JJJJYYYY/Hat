import Vue, { CreateElement, VNode } from 'vue'
import { State, Getter, Mutation } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'
import '@/style/container/editor.less'

import { KEY_CODE } from '@/enum/common'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import Stage from '@/components/Stage'

import event from '@/util/event'

import { ElementStyle } from '@/type'
import { Size } from '@/type/editor'

@Component({
  components: {
    Stage
  }
})
export default class Editor extends Vue {
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Getter selectedBoxes!: any
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.PRESS_MULTIPLY) private pressMultiply!: Function

  render (h: CreateElement): VNode {
    return (
      <div class='editor full'
        tabindex='1'
        style={this.cptFullSize}
        onKeydown={this.onKeydown}
        onKeyup={this.onKeyup}
        onMousedown={this.onMousedown}
        onMousemove={this.onMousemove}
        onMouseup={this.onMouseup}>
        <Stage />
        <a onClick={this.onChangeModel.bind(this, this.MODEL_PEN)}>pen</a>
      </div >
    )
  }

  get cptFullSize (): ElementStyle {
    return {
      width: `${this.window.width}px`,
      height: `${this.window.height}px`,
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

  onChangeModel (model: string, active?: boolean) {
    if (this.notActiveModel === model) {
      this.changeNotActiveModel(MODEL.NONE)
    } else {
      active ? this.changeModel(model)
        : this.changeNotActiveModel(model)
    }
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
        this.selectedBoxes.forEach((box: any) => {
          box.moveBox(e)
        })
        break
      case MODEL.SCALE:
        this.selectedBoxes.forEach((box: any) => {
          box.scaleBox(e)
        })
        break
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.MOVE:
        this.selectedBoxes.forEach((box: any) => {
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
