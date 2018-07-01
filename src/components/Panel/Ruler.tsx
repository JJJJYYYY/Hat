import Vue from 'vue'
import { State } from 'vuex-class'
import { Component, Provide, Prop, Watch } from 'vue-property-decorator'
import { Size, Coord } from '@/type/editor'
import '@/style/components/ruler.less'

interface NumAndStep {
  num: number
  step: number
}

const canvasSize = 20
const midLine = 12
const shortLine = 8
const baseUnit = [1, 2, 5, 10]
const baseStep = 100

const floatReg = /^0\.(0)?[1-9]/
function getOrder (num: number): number {
  if (num >= 1) {
    const len = `${num}`.split('.')[0].length - 1
    return +Math.pow(10, len).toFixed(len)
  } else {
    const len = ((`${num}`.match(floatReg) || ['', ''])[1] || '').length + 1
    return +Math.pow(0.1, len).toFixed(len)
  }
}

@Component
export default class Ruler extends Vue {
  tickTimer?: number

  @Provide() verticalCtx?: CanvasRenderingContext2D
  @Provide() landscapeCtx?: CanvasRenderingContext2D

  @State(state => state.editor.ratio) ratio!: number
  @State(state => state.editor.window) window!: Size
  @State(state => state.editor.stage) stage!: Coord & Size

  render () {
    return (
      <div>
        <canvas
          ref='vertical'
          class='ruler vertical'
          width={canvasSize}
          height={this.window.height}
        ></canvas>
        <canvas
          ref='landscape'
          class='ruler landscape'
          width={this.window.width}
          height={canvasSize}
        ></canvas>
        <div
          class='ruler ruler-corner'
        ></div>
      </div>
    )
  }

  mounted () {
    this.verticalCtx = (this.$refs.vertical as HTMLCanvasElement).getContext('2d')!
    this.landscapeCtx = (this.$refs.landscape as HTMLCanvasElement).getContext('2d')!

    // this.$nextTick(this.drawRuler)
    this.tick(this.drawScale)
  }

  @Watch('ratio')
  @Watch('window', { deep: true })
  onScaleRatio (newVal: number, oldVal: number) {
    this.tick(this.drawScale)
  }

  tick (cb: Function) {
    if (this.tickTimer) return
    this.tickTimer = setTimeout(() => {
      cb()
      this.tickTimer = void 0
    }, 30)
  }

  drawScale () {
    const ratio = this.ratio
    let { width, height } = this.window
    let { x, y, width: stageW, height: stageH } = this.stage
    x += stageW * (1 - ratio) / 2
    y += stageH * (1 - ratio) / 2

    let unit = baseStep / this.getNum(ratio)
    let step = unit * ratio

    this.drawLandscape(x, width, ratio, unit, step)
    this.drawVertical(y, height, ratio, unit, step)
  }

  drawLandscape (x: number, range: number, ratio: number, unit: number, step: number) {
    const ctx = this.landscapeCtx!

    ctx.clearRect(0, 0, range, canvasSize)
    ctx.beginPath()

    let i = -Math.ceil(x / ratio / unit)
    let len = 0
    for (; len < range; i++) {
      len = i * step + x
      ctx.moveTo(len, 0)
      ctx.lineTo(len, canvasSize)
      ctx.strokeText(`${~~(i * unit)}`, len + 2, 8)
      for (let j = 1; j < 10; j++) {
        len += step / 10
        ctx.moveTo(len, j % 2 === 0 ? shortLine : midLine)
        ctx.lineTo(len, canvasSize)
      }
    }

    ctx.closePath()
    ctx.stroke()
  }

  drawVertical (y: number, range: number, ratio: number, unit: number, step: number) {
    const ctx = this.verticalCtx!

    ctx.clearRect(0, 0, canvasSize, range)
    ctx.beginPath()

    let i = -Math.ceil(y / ratio / unit)
    let len = 0
    for (; len < range; i++) {
      len = i * step + y
      ctx.moveTo(0, len)
      ctx.lineTo(canvasSize, len)
      ctx.strokeText(`${~~(i * unit)}`, 0, len + 10)
      for (let j = 1; j < 10; j++) {
        len += step / 10
        ctx.moveTo(j % 2 === 0 ? shortLine : midLine, len)
        ctx.lineTo(canvasSize, len)
      }
    }

    ctx.closePath()
    ctx.stroke()
  }

  getNum (ratio: number): number {
    const order = getOrder(ratio)
    const units = baseUnit.map(u => u * order)
    return units[units.findIndex(unit => unit > ratio) - 1] || 0.1
  }
}
