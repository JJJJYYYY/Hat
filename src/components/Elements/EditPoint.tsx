import { HatElement } from '@/types/editor'
import Vue from 'vue'
import { Component, Provide, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import { deepCopy, copyElement } from '@/util'
import ChangeEle from '@/minix/ChangeEle'
import { TYPE } from '@/enum/store'

const RADIUS = 4
const PREFIX = 'point-'
const idReg = new RegExp(`${PREFIX}(\\\d+)`)

function getIndex (str: string): number {
  const result = str.match(idReg)
  return result ? (isNaN(+result[1]) ? -1 : +result[1]) : -1
}
@Component
export default class EditPoint extends Vue {
  index: number = -1

  @Provide() d: number[][] = []

  @State(state => state.editor.editElement) private element?: HatElement
  @Mutation(TYPE.UPDATE_ELE) private updateElement!: Function

  render () {
    return (
      <keep-alive>
        <g
          onMousedown={this.onMousedown}
          onMouseup={this.onMouseup}
        >
          {
            this.d.map(([ x, y ]: number[], i) =>
              <circle
                id={[PREFIX + i]}
                cx={x}
                cy={y}
                r={RADIUS}
                fill='red'
              />
            )
          }
        </g>
      </keep-alive>
    )
  }

  @Watch('element')
  commitUpdate (ele: HatElement) {
    if (ele) {
      const newEle = copyElement(ele)
      newEle.onEdit = this.onEdit

      this.d = newEle.attrs.d

      this.updateElement(newEle)
    }
  }

  onMousedown ({ target }: MouseEvent) {
    this.index = -1
    if (target) {
      this.index = getIndex((target as any).id)
    }
  }

  onMouseup ({ target }: MouseEvent) {
    this.index = -1
  }

  onEdit (e: MouseEvent) {
    const { index, d } = this
    if (index > -1) {
      d.splice(index, 1, [e.pageX, e.pageY])
    }
  }
}
