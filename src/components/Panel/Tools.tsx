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
    return (
      <ul
        class='tools'
      >
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_PEN)}
        >
          <Icon type='pen' width='40' height='40' color='red' />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_LINE)}
        >
          <Icon type='pen' width='40' height='40' color='red' />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_CIRCLE)}
        >
          <Icon type='pen' width='40' height='40' color='red' />
        </li>
        <li
          onClick={this.onChangeModel.bind(this, MODEL.DRAW_POLY)}
        >
          <Icon type='pen' width='40' height='40' color='red' />
        </li>
      </ul>
    )
  }

  onChangeModel (model: string) {
    this.changeModel(model === this.model ? MODEL.NONE : model)
  }
}
