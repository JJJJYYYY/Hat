import Vue, { CreateElement, VNode } from 'vue'
import { State, Mutation, Action, Getter } from 'vuex-class'
import { Component, Provide, Prop } from 'vue-property-decorator'
import '@/style/components/stage.less'

import { ElementStyle } from '@/type'
import { IndexElement } from '@/type/editor'
import { MODEL } from '@/enum/editor'
import { TYPE } from '@/enum/store'

import DrawPen from '@/elements/DrawPen'
import Box from '@/elements/Box'

import event from '@/util/event'
import { drawCurvePath } from '@/util/draw'

@Component({
  components: { DrawPen }
})
class Elements extends Vue {
  @State(state => state.editor.elements) elements!: IndexElement[]

  render (h: CreateElement): VNode {
    let elements = this.elements.map(ele => {
      switch (ele.type) {
        case DrawPen.name:
          return <DrawPen element={ele} />
      }
    })
    return <g>{ elements }</g>
  }
}

const defaultSize = {
  minX: window.innerWidth,
  minY: window.innerHeight,
  maxX: 0,
  maxY: 0
}
let oldPath = ''
let pathSize = Object.assign({}, defaultSize)
@Component({
  // components: { Box, Elements }
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
  @Getter private getElementCount!: number
  @Action private selectBox!: Function

  render () {
    return (
      <svg
        id='stage'
        class='stage'
        version='1.1' baseProfile='full'
        xmlns='http://www.w3.org/2000/svg'
        width={this.width}
        height={this.height}
        style={this.cptSize}
        onClick={this.onClick}
        onMousedown={this.onMousedown}
        onMousemove={this.onMousemove}
        onMouseup={this.onMouseup}>
        <path
          stroke='#000'
          fill='none'
          stroke-dasharray='none'
          d={this.realDrawPath}>
        </path>
        <Box x={100} y={100} width={100} height={100} />
        <Elements />
      </svg>
    )
  }

  get cptSize (): ElementStyle {
    return {
      background: `${'#fff'}`
    }
  }

  get realDrawPath (): string {
    let drawPath = this.drawPath
    if (drawPath.length) {
      let newPoint = drawPath[drawPath.length - 1]

      pathSize.minX = Math.min(newPoint[0], pathSize.minX)
      pathSize.minY = Math.min(newPoint[1], pathSize.minY)
      pathSize.maxX = Math.max(newPoint[0], pathSize.maxX)
      pathSize.maxY = Math.max(newPoint[1], pathSize.maxY)
    }
    oldPath = drawCurvePath(oldPath, drawPath)

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
        let path: IndexElement = {
          i: Math.max(this.getElementCount, 0),
          type: DrawPen.name,
          attrs: {
            x: pathSize.minX - 10,
            y: pathSize.minY - 10,
            width: pathSize.maxX - pathSize.minX + 20,
            height: pathSize.maxY - pathSize.minY + 20,
            d: this.realDrawPath
          }
        }
        pathSize = Object.assign({}, defaultSize)
        this.addElement(path)
        this.drawPath = []
        oldPath = ''
        e.stopPropagation()
        break
    }
  }
}
