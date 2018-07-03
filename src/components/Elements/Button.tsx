import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class Button extends Vue {
  render () {
    return (
      <div>Button</div>
    )
  }
}
