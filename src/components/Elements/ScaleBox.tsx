import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import '@/style/elements/box.less'

import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'
import { ElementStyle } from '@/types'
import { Coord, EleBox, HatElement } from '@/types/editor'

import { noop, copyElement, deepCopy } from '@/util'
import event from '@/util/event'
import EditorConfig from '@/config/editor'
import { stop } from '@/util/decorator'
import ChangeEle from '@/minix/ChangeEle'

const ROTATE_POINT_TOP = 20
const ROTATE_POINT_R = 6

enum DIR {
  LEFT = 'l',
  TOP = 't',
  RIGHT = 'r',
  BOTTOM = 'b'
}

const POINTS: string[] = [
  `${DIR.LEFT}-${DIR.BOTTOM}`,
  `${DIR.LEFT}`,
  `${DIR.LEFT}-${DIR.TOP}`,
  `${DIR.TOP}`,
  `${DIR.RIGHT}-${DIR.TOP}`,
  `${DIR.RIGHT}`,
  `${DIR.RIGHT}-${DIR.BOTTOM}`,
  `${DIR.BOTTOM}`
]

@Component
export default class MoveBox extends ChangeEle {
  name = 'MoveBox'

  dir: string = ''

  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: (model: string) => void
  @Action private transformEle!: Function

  render (): VNode {
    const {
      scalePoint,
      onScaleStart,
      onMouseup,
      transform,
      rotatePoint,
      onRotateStart,
      element
    } = this

    const scalePoints = POINTS.map((p, i) => {
      return (
        <circle
          r='4'
          vector-effect='non-scaling-stroke'
          key={p}
          cx={scalePoint[i].x}
          cy={scalePoint[i].y}
          data-type={p}
          class={ `box-point ${p}`}
          onMousedown={onScaleStart.bind(this, p)}
          onMouseup={onMouseup}
        ></circle>
      )
    })
    return (
      <g
        transform={transform}
      >
        <circle
          class='rotate-point'
          vector-effect='non-scaling-stroke'
          r={ROTATE_POINT_R}
          cx={rotatePoint.x}
          cy={rotatePoint.y}
          onMousedown={onRotateStart}
          onMouseup={onMouseup}
        ></circle>
        <line
          stroke='#000'
          x1={rotatePoint.x}
          y1={rotatePoint.y}
          x2={rotatePoint.x}
          y2={element.attrs.y}
        ></line>
        { scalePoints }
      </g>
    )
  }

  get scalePoint (): Coord[] {
    const {
      scale,
      centerPoint,
      element: {
        attrs: {
          x,
          y,
          width,
          height
        }
      }
    } = this

    return POINTS.map(p => {
      const l: Coord = {
        x: centerPoint.x,
        y: centerPoint.y
      }

      p.split('-').map(dir => {
        switch (dir) {
          case DIR.LEFT:
            l.x = x
            break
          case DIR.TOP:
            l.y = y
            break
          case DIR.RIGHT:
            l.x = x + width
            break
          case DIR.BOTTOM:
            l.y = y + height
            break
        }
      })

      return l
    })
  }

  get rotatePoint (): Coord {
    const {
      centerPoint,
      element: {
        attrs: {
          y
        }
      }
    } = this
    return {
      x: centerPoint.x,
      y: y - ROTATE_POINT_TOP
    }
  }

  mounted () {
    this.commitUpdate(this.element)
  }

  commitUpdate (ele: HatElement) {
    const newEle = copyElement(ele)
    newEle.onScale = this.onScale.bind(this)

    this.updateElement(newEle)
  }

  onMouseup () {
    this.$nextTick(() => this.changeModel(MODEL.NONE))
  }

  onScale (e: MouseEvent) {
    const {
      dir,
      scale: originScale,
      offset: originOffset,
      stage,
      element: {
        attrs: {
          x,
          y,
          width,
          height
        }
      }
    } = this

    const scale = deepCopy(originScale)
    const offset = deepCopy(originOffset)

    dir.split('-').forEach(l => {
      switch (l) {
        case DIR.LEFT:
          let diffX = stage.x + x - e.pageX
          scale.x = diffX / width + 1
          offset.x = -diffX
          break
        case DIR.TOP:
          let diffY = stage.y + y - e.pageY
          scale.y = diffY / height + 1
          offset.y = -diffY
          break
        case DIR.RIGHT:
          scale.x = (e.pageX - stage.x - x) / width
          break
        case DIR.BOTTOM:
          scale.y = (e.pageY - stage.y - y) / height
          break
      }
    })

    this.transformEle({ scale, offset })
  }

  @stop
  onScaleStart (dir: string, e: MouseEvent) {
    this.dir = dir
    this.changeModel(MODEL.SCALE)
  }

  @stop
  onRotateStart () {
    this.changeModel(MODEL.ROTATE)
  }
}
