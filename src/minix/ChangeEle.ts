import Vue from 'vue'
import { Provide, Prop } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import { Coord, HatElement } from '@/types/editor'
import { TYPE } from '@/enum/store'
import { noop } from '@/util'
import { MODEL } from '@/enum/editor'
import { stop } from '@/util/decorator'

export default abstract class ChangeEle extends Vue {
  @Prop() element!: HatElement
  @State(state => state.editor.scale) protected scale!: Coord
  @State(state => state.editor.offset) protected offset!: Coord
  @State(state => state.editor.angle) protected angle!: number
  @State(state => state.editor.stage) protected stage!: Coord
  @State(state => state.editor.ratio) protected ratio!: number
  @Mutation(TYPE.UPDATE_ELE) protected updateElement!: Function
  @Mutation(TYPE.EDIT_ELEMENT) protected editElement!: Function
  @Mutation(TYPE.CHANGE_MODEL) protected changeModel!: (model: string) => void
  @Action('selectBox') private selectEle!: (ele: HatElement) => void

  abstract commitUpdate (ele: HatElement, oldEle?: HatElement): void

  get rotateAngle (): string {
    const angle = this.element.attrs.rotate + this.angle
    return `rotate(${angle} ${this.centerPoint.x} ${this.centerPoint.y})`
  }

  get centerPoint (): Coord {
    const {
      element: {
        attrs: {
          x,
          y,
          width,
          height
        }
      }
    } = this
    return { x: x + width / 2, y: y + height / 2 }
  }

  get transform (): string {
    const { offset, scale, rotateAngle, element: { attrs: { x, y } } } = this
    return (
      `translate(${offset.x},${offset.y}) ` +
      `translate(${x},${y}) ` +
      `scale(${scale.x},${scale.y}) ` +
      `translate(${-x},${-y})` +
      rotateAngle
    )
  }

  selectThis () {
    this.selectEle(this.element)
  }

  @stop
  editThis () {
    this.editElement(this.element)
    this.changeModel(MODEL.EDITING)
  }
}
