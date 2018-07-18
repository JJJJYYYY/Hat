import Vue, { CreateElement, VNode } from 'vue'
import { State, Mutation, Action, Getter } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import '@/style/components/Stage.less'

import { ElementStyle } from '@/types'
import { Size, Coord, HatElement, EleRect, EleBox } from '@/types/editor'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import ElementsMap from './Elements'
import DrawPath from './Elements/DrawPath'
import Draw from '@/components/Elements/Draw'
import Ruler from '@/components/Panel/Ruler'

import { noop, empty } from '@/util'
import event from '@/util/event'
import { getUuid } from '@/util/uuid'
import getDrawMethod, { getRectPath } from '@/util/draw'
import { self, once, ctrl, prevent } from '@/util/decorator'
import SelectBox from '@/components/Elements/MoveBox'

let clickTime = 0

let oldPath = ''

const DrawModel = [ MODEL.DRAW_LINE, MODEL.DRAW_PEN, MODEL.DRAW_CIRCLE, MODEL.DRAW_POLY ]
function isDraw (model: string) {
  return (DrawModel as string[]).includes(model)
}

@Component
export default class Stage extends Vue {
  startPoint?: Coord

  @Provide() select: EleRect | null = null
  @Provide() currDraw?: HatElement
  @Provide() drawPath: number[][] = []

  @Action selectBox!: Function
  @State(state => state.editor.stage.width) width!: number
  @State(state => state.editor.stage.height) height!: number
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.ratio) ratio!: number
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.elements) elements!: HatElement[]
  @State(state => state.editor.boxIds) private boxIds!: number[]
  @State(state => state.editor.selectedElements) private selectedElements!: HatElement[]
  @Mutation(TYPE.STAGE_CHANGE) private changeStage!: Function
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.SCALE_RADIO) private scaleRatio!: Function
  @Mutation(MODEL.CANCEL) private cancelSelect!: Function
  @Mutation(TYPE.ADD_ELE) private addElement!: Function
  @Action private pressMultiply!: Function

  render (): VNode {
    const {
      isDrawing,
      baseStyle,
      style,
      selectPath,
      realPath,
      renderStage,
      renderSelectBoxes,
      renderElements,
      onDrawDown,
      onDrawMove,
      onDrawUp,
      onDragDown,
      onDragMove,
      onDragUp
    } = this

    return (
      <div
        ref='stage'
        class='stage'
        onMousedown={onDragDown}
        onMousemove={onDragMove}
        onMouseup={onDragUp}
      >
        <div
          ref='stageContain'
          class='stage-contain'
        >
          {
            [
              renderStage(
                'stage-svg',
                style,
                true,
                [
                  renderElements(),
                  renderSelectBoxes(),
                  <DrawPath
                    className='select-box'
                    color='blue'
                    d={selectPath}
                  />
                ]
              ),
              renderStage(
                'draw-stage-svg',
                baseStyle,
                isDrawing,
                [
                  <DrawPath
                    width='5'
                    d={realPath}
                  />
                ],
                onDrawDown,
                onDrawMove,
                onDrawUp
              )
            ]
          }
        </div>
        <Ruler />
      </div>
    )
  }

  renderSelectBoxes (): VNode[] {
    return this.selectedElements.map(
      (ele, i) => <SelectBox element={ele} index={i} key={ele.id} />
    )
  }

  renderElements (): VNode[] {
    return this.elements.map(this.getElement)
  }

  getElement (ele: HatElement, i: number) {
    const ELEMENT = ElementsMap.get(ele.type)
    return ELEMENT
      ? <ELEMENT element={ele} index={i} key={i} />
      : null
  }

  renderStage (
    id: string,
    style: ElementStyle,
    show: boolean,
    children: Vue[],
    onMousedown: Function = noop,
    onMousemove: Function = noop,
    onMouseup: Function = noop
  ) {
    const {
      width,
      height,
      isDrawing,
      onDblclick,
      realPath
    } = this

    return (
      <svg
        id={id}
        version='1.1' baseProfile='full'
        xmlns='http://www.w3.org/2000/svg'
        width={width}
        height={height}
        style={style}
        onDblclick={onDblclick}
        onMousedown={onMousedown}
        onMousemove={onMousemove}
        onMouseup={onMouseup}
        v-show={show}
      >
        { children }
      </svg>
    )
  }

  get isModelNode () {
    return this.model === MODEL.NONE
  }

  get isDrawing () {
    return this.model !== MODEL.NONE && this.model !== MODEL.MOVE
  }

  get realPath () {
    const { currDraw, drawPath } = this
    const draw = currDraw ? getDrawMethod(currDraw.type) : empty

    return oldPath = draw(drawPath, oldPath)
  }

  get selectPath () {
    const { select, isModelNode } = this
    let result = ''
    if (isModelNode && select && select.x1 && select.y2) {
      result = getRectPath(select)
    }
    return result
  }

  get baseStyle (): ElementStyle {
    return {
      transform: `scale(${this.ratio})`
    }
  }

  get style (): ElementStyle {
    return {
      background: `${'#fff'}`,
      ...this.baseStyle
    }
  }

  @Watch('window', { deep: true })
  onWindowResize () {
    let { offsetLeft: left, offsetTop: top } = this.$refs.stage as HTMLElement
    let { offsetLeft, offsetTop } = this.$refs.stageContain as HTMLElement
    this.changeStage({
      x: offsetLeft - this.width / 2 + left,
      y: offsetTop - this.height / 2 + top
    })
  }

  created () {
    // window reset
    window.addEventListener('resize', this.onResizeWindow)
    window.addEventListener('load', this.onResizeWindow)
    window.addEventListener('mousewheel', this.onWindowScale)
  }

  destroyed () {
    window.removeEventListener('resize', this.onResizeWindow)
    window.removeEventListener('load', this.onResizeWindow)
    window.removeEventListener('mousewheel', this.onWindowScale)
  }

  @self
  onDblclick () {
    switch (this.model) {
      case MODEL.DRAW_POLY:
        this.drawEnd()
        break
      default:
        this.changeModel(MODEL.NONE)
    }
  }

  onDrawDown (e: MouseEvent) {
    clickTime = Date.now()
    if (isDraw(this.model)) {
      switch (this.model) {
        case MODEL.DRAW_POLY:
          if (!this.currDraw) {
            this.createDraw(this.model, [e.offsetX, e.offsetY])
          }
          break
        default:
          this.createDraw(this.model, [e.offsetX, e.offsetY])
      }
    } else {
      this.select = { x1: e.offsetX, y1: e.offsetY, x2: 0, y2: 0 }
      this.pressMultiply(true)
    }
  }

  onDrawMove (e: MouseEvent) {
    if (isDraw(this.model)) {
      switch (this.model) {
        case MODEL.DRAW_POLY:
          this.replacePoint([e.offsetX, e.offsetY])
          break
        default:
          this.drawPoint([e.offsetX, e.offsetY])
      }
    } else {
      if (this.select) {
        this.select.x2 = e.offsetX
        this.select.y2 = e.offsetY
        this.selectElement(this.select, this.elements)
      }
    }
  }

  onDrawUp (e: MouseEvent) {
    if (this.currDraw) {
      this.drawPoint([e.offsetX, e.offsetY])
      switch (this.model) {
        case MODEL.DRAW_POLY:
          break
        default:
          this.drawEnd()
      }
    } else {
      this.select = null
      this.pressMultiply(false)
    }
  }

  onDragDown (e: MouseEvent) {
    this.startPoint = { x: e.offsetX, y: e.offsetY }
  }

  onDragMove (e: MouseEvent) {
    switch (this.model) {
      default:
        this.selectedElements.forEach(ele => ele.onMove(e, this.startPoint))
    }
  }

  onDragUp (e: MouseEvent) {
    switch (this.model) {
      default:
        this.selectedElements.forEach(ele => ele.onCommit(e))
        return
    }
  }

  createDraw (type: string, point: number[]) {
    this.currDraw = {
      id: getUuid(),
      type: type,
      attrs: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotate: 0,
        d: []
      },
      onMove: noop,
      onScale: noop,
      onRotate: noop,
      onCommit: noop
    }
    this.drawPoint(point)
  }

  replacePoint (point: number[]) {
    const { currDraw, drawPath } = this
    const len = drawPath.length
    if (currDraw && len) {
      drawPath.pop()
      drawPath.push(point)
    }
  }

  drawPoint (point: number[]) {
    this.currDraw && this.drawPath.push(point)
  }

  drawEnd () {
    if (this.currDraw) {
      const drawPath = (getDrawMethod(this.currDraw.type) as any).getPath(this.drawPath)

      Object.assign(this.currDraw.attrs, {
        rotate: 0,
        d: drawPath
      })

      this.addElement(this.currDraw)
      this.currDraw = void 0
      this.drawPath = []
    }
  }

  selectElement (range: EleRect, elements: HatElement[]) {
    this.$children.forEach(ele => {
      const box = ele.$children[0] as EleBox
      if (this.model !== MODEL.NONE || !box || !box.boxId) return
      const selected = this.boxIds.includes(box.boxId)
      const inRange = this.inRange(range, box)
      if (
        !selected &&
        inRange
      ) {
        this.selectBox(box)
      } else if (
        selected &&
        !inRange
      ) {
        this.cancelSelect(box)
      }
    })
  }

  onResizeWindow () {
    this.$store.commit(TYPE.RESIZE_WINDOW, {
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  @ctrl
  @prevent
  onWindowScale ({ deltaY }: WheelEvent) {
    const ratio = deltaY < 0
      ? this.ratio + 0.01
      : Math.max(this.ratio - 0.01, 0.05)

    this.scaleRatio(ratio)
  }

  inRange ({ x1, y1, x2, y2 }: EleRect, ele: EleBox): boolean {
    if (x1 > x2) {
      const a = x1
      x1 = x2
      x2 = a
    }
    if (y1 > y2) {
      const a = y1
      y1 = y2
      y2 = a
    }
    // TODO: add different dir return different result
    return (
      x1 <= ele.x &&
      x2 >= ele.x + ele.width &&
      y1 <= ele.y &&
      y2 >= ele.y + ele.height
    )
  }
}
