import Vue, { CreateElement, VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'

import { ElementStyle } from '@/type'
import { Element } from '@/type/editor'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import DrawPath from '@/components/Elements/DrawPath/index.vue'

import event from '@/util/event'
import { drawPath } from '@/util/draw'

@Component({
  components: { DrawPath }
})
class Elements extends Vue {
  @State(state => state.editor.elements) elements!: Element[]

  render (h: CreateElement): VNode {
    let elements = this.elements.map(ele => {
      switch (ele.type) {
        case DrawPath.name:
          return h(DrawPath.name, { props: { data: ele } })
      }
    })
    return h(
      'g',
      elements as any
    )
  }
}

let oldPath = ''
@Component({
  components: { Elements }
})
export default class Stage extends Vue {
  @Provide() width = 1000
  @Provide() height = 600
  @Provide() drawPath: number[][] = []

  @State(state => state.editor.model) model!: string
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.ADD_ELE) private addElement!: Function
  @Action private selectBox!: Function

  get cptSize (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  get realDrawPath (): string {
    oldPath = drawPath(oldPath, this.drawPath)
    console.log(oldPath)
    return oldPath
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
        let path: Element = {
          type: DrawPath.name,
          attrs: {
            d: this.realDrawPath
          }
        }
        this.addElement(path)
        this.drawPath = []
        oldPath = ''
        break
    }

    this.changeModel(MODEL.NONE)
    event.$emit(MODEL.NONE, e)
  }
}
