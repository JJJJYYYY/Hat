import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class Icon extends Vue {
  @Prop() className?: string
  @Prop() type?: string
  @Prop({ default: 0 }) width!: number
  @Prop({ default: 0 }) height!: number
  @Prop({ default: 'black' }) color!: string

  render () {
    const { path, color, width, height, className } = this

    return (
      <img
        src={path}
        class={`icon ${className}`}
        width={width}
        height={height}
        color={color}
      />
    )
  }

  get path () {
    const type = this.type
    return type ? `/static/icon/${type}.svg` : ''
  }
}
