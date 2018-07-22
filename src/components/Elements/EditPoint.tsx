import { HatElement } from '@/types/editor'
import Vue from 'vue'
import { Component, Provide, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { deepCopy } from '@/util'

const RADIUS = 4
@Component
export default class EditPoint extends Vue {
  @Provide() d: number[][] = []

  @State(state => state.editor.editElement) element?: HatElement

  render () {
    return (
      <keep-alive>
        <g>
          {
            this.d.map(([ x, y ]: number[]) =>
              <circle
                cx={x}
                cy={y}
                r={RADIUS}
                fill='red'
              />
            )
          }
        </g>
      </keep-alive>
    )
  }

  @Watch('element')
  getNewD (element?: HatElement) {
    // TODO: only hide not to init
    this.d = element ? deepCopy(element.attrs.d) : []
  }
}
