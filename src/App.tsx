import Vue, { CreateElement, VNode } from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {
  render (h: CreateElement): VNode {
    return (
      <div id='app'>
        <router-view/>
      </div>
    )
  }
}
