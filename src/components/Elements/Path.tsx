import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class Path extends Vue {
  name = 'Path'

  @Prop() d!: string
  @Prop() className!: string
  @Prop({ default: '#000' }) color!: string

  render () {
    const { d, color, className } = this

    return (
      <path
        d={d}
        class={[className]}
        stroke={color}
        vector-effect='non-scaling-stroke'
        fill='none'>
      </path>
    )
  }
}
