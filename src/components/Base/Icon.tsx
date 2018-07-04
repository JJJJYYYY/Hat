import Vue from 'vue'
import { Component, Prop, Watch, Provide } from 'vue-property-decorator'

const svgReg = /<svg[^>]+>(.+)<\/svg>/mi

@Component
export default class Icon extends Vue {
  @Provide() path: string = ''

  @Prop() src?: string
  @Prop({ default: '' }) className?: string
  @Prop({ default: 0 }) width!: number
  @Prop({ default: 0 }) height!: number
  @Prop({ default: 'black' }) color!: string

  render () {
    const { path, color, width, height, className } = this

    return (
      <svg
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 1024 1024'
        domPropsInnerHTML={path}
        class={['icon', className]}
        width={width}
        height={height}
        fill={color}
      >
      </svg>
    )
  }

  mounted () {
    this.fetchIcon()
  }

  @Watch('src')
  onType () {
    this.fetchIcon()
  }

  fetchIcon () {
    fetch(this.src)
      .then((res) => {
        res.text().then(svg => {
          this.path = this.getPath(svg)
        })
      })
      .catch(err => console.error(err))
  }

  getPath (svgStr: string): string {
    return (svgStr.match(svgReg) || [])[1] || ''
  }
}
