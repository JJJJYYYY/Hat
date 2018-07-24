import { HatElement, Coord } from '@/types/editor'
import Vue from 'vue'
import { Component, Provide, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import { deepCopy, copyElement } from '@/util'
import ChangeEle from '@/minix/ChangeEle'
import { TYPE } from '@/enum/store'
import ElementsMap from '@/components/Elements'

const RADIUS = 4
const PREFIX = 'point-'
const idReg = new RegExp(`${PREFIX}(\\\d+)`)

function getIndex (str: string): number {
  const result = str.match(idReg)
  return result ? (isNaN(+result[1]) ? -1 : +result[1]) : -1
}

function getCenter (d: number[][]): number[][] {
  const last = d.length - 1
  return (d.length ? [d[0]] : []).concat(d.map((n, i) => {
    if (i % 2 === 0) return []
    if (i !== last) {
      const next = d[i + 1]

      return [(next[0] + n[0]) / 2, (next[1] + n[1]) / 2]
    } else {
      return [n[0], n[1]]
    }
  }))
}
@Component
export default class EditPoint extends Vue {
  index: number = -1

  movePoint?: number[]

  origin: number[][] = []

  @Provide() d: number[][] = []

  @State(state => state.editor.offset) private offset!: Coord
  @State(state => state.editor.editElement) private element?: HatElement
  @Mutation(TYPE.UPDATE_ELE) private updateElement!: Function

  render () {
    const { element } = this
    const ELEMENT = element ? ElementsMap.get(element.type) : null

    return (
      <keep-alive>
        <g
          onMousedown={this.onMousedown}
          onMouseup={this.onMouseup}
        >
          {
            this.d.map(([ x, y ]: number[], i) =>
              x && y
                ? <circle
                    id={[PREFIX + i]}
                    cx={x}
                    cy={y}
                    r={RADIUS}
                    fill='red'
                  />
                : null
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

      this.updateElement(newEle)

      this.origin = deepCopy(ele.attrs.d)
      this.d = getCenter(newEle.attrs.d)
    }
  }

  onMousedown ({ target }: MouseEvent) {
    this.index = -1
    if (target) {
      this.index = getIndex((target as any).id)
      this.movePoint = this.d[this.index]
    }
  }

  onMouseup ({ target }: MouseEvent) {
    this.index = -1
    this.movePoint = void 0
  }

  onEdit (e: MouseEvent) {
    const { index, movePoint, d, offset, origin } = this
    const originD = this.element!.attrs.d
    // TODO: index === 0 and update element
    if (index > -1 && movePoint) {
      const moved = [movePoint[0] + offset.x, movePoint[1] + offset.y]
      d.splice(index, 1, moved)
      originD.splice(
        index - 1,
        2,
        [ origin[index - 1][0] + offset.x, origin[index - 1][1] + offset.y ],
        [ origin[index][0] + offset.x, origin[index][1] + offset.y ]
      )
    }
  }
}
