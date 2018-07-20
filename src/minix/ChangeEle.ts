import Vue from 'vue'
import { Provide, Prop } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import { Coord, HatElement } from '@/types/editor'
import { TYPE } from '@/enum/store'
import { noop } from '@/util'

let uuid = 1
export default abstract class ChangeEle extends Vue {
  @Provide() moveCb: Function = noop
  id = ++uuid

  @Prop() element!: HatElement
  @State(state => state.editor.scale) protected scale!: Coord
  @State(state => state.editor.offset) protected offset!: Coord
  @State(state => state.editor.angle) protected angle!: number
  @State(state => state.editor.stage) protected stage!: Coord
  @State(state => state.editor.ratio) protected ratio!: number
  @Mutation(TYPE.UPDATE_ELE) protected updateElement!: Function

  get rotateAngle (): number {
    return this.element.attrs.rotate + this.angle
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
    console.log('id: ', this.id)
    const { scale, element: { attrs: { x, y } } } = this
    return (
      `translate(${this.offset.x},${this.offset.y}) ` +
      `translate(${x},${y}) ` +
      `scale(${scale.x},${scale.y}) ` +
      `translate(${-x},${-y})` +
      `rotate(${this.rotateAngle} ${this.centerPoint.x} ${this.centerPoint.y})`
    )
  }
}
