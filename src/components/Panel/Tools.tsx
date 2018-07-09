import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'
import '@/style/components/Tools.less'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import Icon from '@/components/Base/Icon'

@Component
export default class Box extends Vue {
  name = 'Tools'

  @State(state => state.editor.model) model!: string
  @Mutation(TYPE.CHANGE_MODEL) private changeModel!: Function

  render (): VNode {
    const { none, pen, line, circle, poly } = this

    return (
      <ul
        class='tools'
      >
        <li
          onClick={this.onChangeModel.bind(this, MODEL.NONE)}
        >
          <Icon
            className={[ none && 'active' ]}
            src='/static/icon/mouse.svg'
            width='30'
            height='30'
          />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_PEN)}
        >
          <Icon
            className={[ pen && 'active' ]}
            src='/static/icon/pen.svg'
            width='30'
            height='30'
          />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_LINE)}
        >
          <Icon
            className={[ line && 'active' ]}
            src='/static/icon/ruler.svg'
            width='30'
            height='30'
          />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_CIRCLE)}
        >
          <Icon
            className={[ circle && 'active' ]}
            src='/static/icon/circle.svg'
            width='30'
            height='30'
          />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_POLY)}
        >
          <Icon
            className={[ poly && 'active' ]}
            src='/static/icon/poly.svg'
            width='30'
            height='30'
          />
        </li>
      </ul>
    )
  }

  onChangeModel (model: string) {
    this.changeModel(model === this.model ? MODEL.NONE : model)
  }

  get none (): boolean {
    return this.model === MODEL.NONE || this.model === MODEL.MOVE
  }

  get pen (): boolean {
    return this.model === MODEL.DRAW_PEN
  }

  get line (): boolean {
    return this.model === MODEL.DRAW_LINE
  }

  get circle (): boolean {
    return this.model === MODEL.DRAW_CIRCLE
  }

  get poly (): boolean {
    return this.model === MODEL.DRAW_POLY
  }
}
