import Vue, { VNode } from 'vue'
import { State, Mutation, Action } from 'vuex-class'
import { Component, Provide, Prop, Watch, Model } from 'vue-property-decorator'

@Component
export default class Box extends Vue {
  name = 'MenuBox'

  render (): VNode {
    return (
      <div>1111</div>
    )
  }

  onMousedown (e: MouseEvent) {
    //
  }

  onMouseup (e: MouseEvent) {
    //
  }

  onMousemove (e: MouseEvent) {
    //
  }
}
