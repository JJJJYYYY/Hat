import Vue, { CreateElement, VNode } from 'vue'
import { State, Mutation, Action, Getter } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import '@/style/components/stage.less'

import { ElementStyle } from '@/type'
import { Size, Coord, Element, IndexElement } from '@/type/editor'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import DrawPen from '@/elements/DrawPen'
import Box from '@/elements/Box'

import event from '@/util/event'
import { drawCurvePath } from '@/util/draw'
import { self, once } from '@/util/decorator'

const defaultSize = {
  minX: window.innerWidth,
  minY: window.innerHeight,
  maxX: 0,
  maxY: 0
}
let oldPath = ''
let pathSize = Object.assign({}, defaultSize)

@Component
export default class Stage extends Vue {
  // startPoint?: Coord
  test = 1

  @Provide() width = 1000
  @Provide() height = 600
  @Provide() drawPath: number[][] = []

  @Action selectBox!: Function
  @State(state => state.editor.model) model!: string
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.elements) elements!: Element[]
  @State(state => state.editor.notActiveModel) notActiveModel!: string
  @Mutation(TYPE.STAGE_CHANGE) private changeStage!: Function
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function
  @Mutation(TYPE.CHANGE_NOT_ACTIVE_MODEL) private changeNotActiveModel!: Function
  @Mutation(TYPE.ADD_ELE) private addElement!: Function
  @Getter private getElementCount!: number

  render (): VNode {
    return (
      <div
        ref='stage'
        class='stage'>
        <svg
          id='stage-svg'
          version='1.2' baseProfile='full'
          xmlns='http://www.w3.org/2000/svg'
          width={this.width}
          height={this.height}
          style={this.size}
          onClick={this.onClick}
          onMousedown={this.onMousedown}
          onMousemove={this.onMousemove}
          onMouseup={this.onMouseup}
          >
          <path
            stroke='#000'
            fill='none'
            stroke-dasharray='none'
            d={this.realDrawPath}
            >
          </path>
          { this.renderElements() }
        </svg>
      </div >
    )
  }

  renderElements () {
    return this.elements.map(ele => {
      switch (ele.type) {
        case DrawPen.name:
          return <DrawPen element={ele} />
      }
    })
  }

  get size (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  get realDrawPath (): string {
    let drawPath = this.drawPath
    oldPath = drawCurvePath(oldPath, drawPath)

    return oldPath
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
    switch (this.model) {
      case MODEL.PEN:
        this.addDrawPath([e.offsetX, e.offsetY])
        break
    }
  }

  @self
  onMousemove (e: MouseEvent) {
    switch (this.model) {
      case MODEL.PEN:
        this.drawPath.length > 0 && this.addDrawPath([e.offsetX, e.offsetY])
        break
    }
  }

  onMouseup (e: MouseEvent) {
    switch (this.model) {
      case MODEL.PEN:
        let path: IndexElement = {
          i: this.elements.length,
          type: DrawPen.name,
          attrs: {
            x: pathSize.minX,
            y: pathSize.minY,
            width: pathSize.maxX - pathSize.minX,
            height: pathSize.maxY - pathSize.minY,
            d: this.drawPath
          }
        }
        pathSize = Object.assign({}, defaultSize)
        this.addElement(path)
        this.drawPath = []
        oldPath = ''
        break
    }

    // this.changeModel(MODEL.NONE)
    // event.$emit(MODEL.NONE, e)
  }

  addDrawPath (point: number[]) {
    pathSize.minX = Math.min(point[0], pathSize.minX)
    pathSize.minY = Math.min(point[1], pathSize.minY)
    pathSize.maxX = Math.max(point[0], pathSize.maxX)
    pathSize.maxY = Math.max(point[1], pathSize.maxY)

    this.drawPath.push(point)
  }
}
