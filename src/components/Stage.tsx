import Vue, { CreateElement, VNode } from 'vue'
import { State, Mutation, Action, Getter } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import '@/style/components/stage.less'

import { ElementStyle } from '@/type'
import { Size, Coord, HatElement, EleLocation } from '@/type/editor'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import ElementsMap from './Elements'
import Path from './Elements/Path'
import Draw from '@/components/Elements/Draw'

import { noop, empty } from '@/util'
import event from '@/util/event'
import getDrawMethod from '@/util/draw'
import { self, once } from '@/util/decorator'

let oldPath = ''

const DrawModel = [ MODEL.DRAW_LINE, MODEL.DRAW_PEN, MODEL.DRAW_CIRCLE ]
function isDraw (model: string) {
  return (DrawModel as string[]).includes(model)
}

@Component
export default class Stage extends Vue {
  @Provide() currDraw?: HatElement
  @Provide() width = 1000
  @Provide() height = 600
  @Provide() drawPath: number[][] = []

  @Action selectBox!: Function
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.elements) elements!: HatElement[]
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Mutation(TYPE.STAGE_CHANGE) private changeStage!: Function
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.ADD_ELE) private addElement!: Function
  @Getter private getElementCount!: number

  render (): VNode {
    const currDraw = this.currDraw
    const last = this.elements.length

    return (
      <div
        ref='stage'
        class='stage'
      >
        <svg
          id='stage-svg'
          version='1.1' baseProfile='full'
          xmlns='http://www.w3.org/2000/svg'
          width={this.width}
          height={this.height}
          style={this.style}
          onClick={this.onClick}
          onMousedown={this.onMousedown}
          onMousemove={this.onMousemove}
          onMouseup={this.onMouseup}
        >
          { this.renderElements() }
          <Path
            d={this.realPath}
          />
        </svg>
      </div >
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

  get realPath () {
    const draw = this.currDraw ? getDrawMethod(this.currDraw.type) : empty

    return oldPath = draw(this.drawPath, oldPath)
  }

  get style (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  @Watch('window', { deep: true })
  onWindowResize () {
    let { offsetLeft, offsetTop } = this.$refs.stage as HTMLElement
    this.changeStage({
      x: offsetLeft - this.width / 2,
      y: offsetTop - this.height / 2
    })
  }

  @self
  onClick () {
    this.selectBox()
  }

  @self
  onMousedown (e: MouseEvent) {
    if (isDraw(this.model)) {
      this.createDraw(this.model, [e.offsetX, e.offsetY])
    }
  }

  @self
  onMousemove (e: MouseEvent) {
    if (isDraw(this.model)) {
      this.draw([e.offsetX, e.offsetY])
    }
  }

  onMouseup (e: MouseEvent) {
    if (this.currDraw) {
      this.drawPoint([e.offsetX, e.offsetY])

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

  draw (point: number[]) {
    if (this.currDraw) {
      this.drawPoint(point)
    }
  }

  createDraw (type: string, point: number[]) {
    this.currDraw = {
      type: type,
      attrs: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotate: 0,
        d: []
      }
    }
    this.drawPoint(point)
  }

  drawPoint (point: number[]) {
    this.drawPath.push(point)
  }
}
