import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class DrawPen extends Vue {
  name = 'Path'

  @Prop() d!: string

  render () {
    return (
      <path
        d={this.d}
        stroke='#000'
        vector-effect='non-scaling-stroke'
        fill='none'
        stroke-dasharray='none'>
      </path>
    )
  }
}
