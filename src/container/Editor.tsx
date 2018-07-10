import Vue, { CreateElement, VNode } from 'vue'
import { State, Getter, Mutation, Action } from 'vuex-class'
import { Component, Provide } from 'vue-property-decorator'
import '@/style/container/editor.less'

import { KEY_CODE } from '@/enum/common'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import Stage from '@/components/Stage'
import Tools from '@/components/Panel/Tools'

import event from '@/util/event'

import { ElementStyle } from '@/types'
import { Size, Coord, EleBox } from '@/types/editor'
@Component
export default class Editor extends Vue {
  startPoint?: Coord

  @State(state => state.editor.model) model!: string
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Getter selectedBoxes!: EleBox[]
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Action private pressMultiply!: Function

  render (): VNode {
    return (
      <div
        tabIndex='0'
        class='editor full'
        style={this.editorStyle}
        onKeydown={this.onKeydown}
        onKeyup={this.onKeyup}
        onMousedown={this.onMousedown}
        onMousemove={this.onMousemove}
        onMouseup={this.onMouseup}
      >
        <Tools />
        <Stage />
        {/* <MenuBox /> */}
        {/* <a onClick={this.onChangeModel.bind(this, MODEL.DRAW_PEN)}>1. pen</a>
        <br/>
        <a onClick={this.onChangeModel.bind(this, MODEL.DRAW_LINE)}>2. line</a>
        <br/>
        <a onClick={this.onChangeModel.bind(this, MODEL.DRAW_CIRCLE)}>3. circle</a>
        <br/>
        <a onClick={this.onChangeModel.bind(this, MODEL.DRAW_POLY)}>4. polyline</a> */}
      </div >
    )
  }

  get editorStyle (): ElementStyle {
    return {
      width: `${this.window.width}px`,
      height: `${this.window.height}px`,
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
    // if (this.notActiveModel) this.changeModel(this.notActiveModel)
    this.startPoint = { x: e.offsetX, y: e.offsetY }

    switch (this.model) {
    }
  }

  onMousemove (e: MouseEvent) {
    switch (this.model) {
      case MODEL.NONE:
        break
      default:
        this.selectedBoxes.forEach((box: EleBox) => {
          (box as any)[this.model] && (box as any)[this.model](e, this.startPoint)
        })
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.NONE:
        break
      default:
        this.selectedBoxes.forEach((box: EleBox) => box.commit(e))
        return
    }
  }

  onMouseout (e: MouseEvent) {
    // todo
  }
}
