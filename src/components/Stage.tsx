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
import { self, once, ctrl, prevent } from '@/util/decorator'

let oldPath = ''

const DrawModel = [ MODEL.DRAW_LINE, MODEL.DRAW_PEN, MODEL.DRAW_CIRCLE, MODEL.DRAW_POLY ]
function isDraw (model: string) {
  return (DrawModel as string[]).includes(model)
}

@Component
export default class Stage extends Vue {
  @Provide() currDraw?: HatElement
  @Provide() drawPath: number[][] = []

  @Action selectBox!: Function
  @State(state => state.editor.stage.width) width!: number
  @State(state => state.editor.stage.height) height!: number
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.ratio) ratio!: number
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.elements) elements!: HatElement[]
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Mutation(TYPE.STAGE_CHANGE) private changeStage!: Function
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.SCALE_RADIO) private scaleRatio!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.ADD_ELE) private addElement!: Function
  @Getter private getElementCount!: number

  render (): VNode {
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
          onDblclick={this.onDblclick}
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
      background: `${'#fff'}`,
      transform: `scale(${this.ratio})`
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
  onClick () {
    this.selectBox()
  }

  @self
  onDblclick () {
    switch (this.model) {
      case MODEL.DRAW_POLY:
        this.drawEnd()
        break
      default:
    }
  }

  @self
  onMousedown (e: MouseEvent) {
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
    }
  }

  @self
  onMousemove (e: MouseEvent) {
    if (isDraw(this.model)) {
      switch (this.model) {
        case MODEL.DRAW_POLY:
          break
        default:
          this.drawPoint([e.offsetX, e.offsetY])
      }
    }
  }

  onMouseup (e: MouseEvent) {
    if (this.currDraw) {
      this.drawPoint([e.offsetX, e.offsetY])
      switch (this.model) {
        case MODEL.DRAW_POLY:
          break
        default:
          this.drawEnd()
      }
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
}
