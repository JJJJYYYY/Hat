import Vue, { CreateElement, VNode } from 'vue'
import { State, Getter, Mutation, Action } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'
import '@/style/container/editor.less'

import { KEY_CODE } from '@/enum/common'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import Stage from '@/components/Stage'

import event from '@/util/event'

import { ElementStyle } from '@/type'
import { Size, Coord } from '@/type/editor'

@Component
export default class Editor extends Vue {
  startPoint?: Coord

  @State(state => state.editor.model) model!: string
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Getter selectedBoxes!: any
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Action private pressMultiply!: Function

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

  onChangeModel (model: string) {
    this.changeModel(model === this.model ? MODEL.NONE : model)
  }

  onMousedown (e: MouseEvent) {
    // if (this.notActiveModel) this.changeModel(this.notActiveModel)
    this.startPoint = { x: e.offsetX, y: e.offsetY }

    switch (this.model) {
    }
  }

  onMousemove (e: MouseEvent) {
    switch (this.model) {
      case MODEL.MOVE:
        console.log(this.selectedBoxes)
        this.selectedBoxes.forEach((box: any) => {
          box[MODEL.MOVE](e, this.startPoint)
        })
        break
      case MODEL.SCALE:
        this.selectedBoxes.forEach((box: any) => {
          box[MODEL.SCALE](e, this.startPoint)
        })
        break
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.MOVE:
        this.selectedBoxes.forEach((box: any) => {
          box[`${MODEL.MOVE}End`](e)
        })
        break
      case MODEL.SCALE:
        this.selectedBoxes.forEach((box: any) => {
          box[`${MODEL.SCALE}End`](e)
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
