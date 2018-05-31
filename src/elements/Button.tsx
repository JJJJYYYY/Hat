import Vue from 'vue'
import Component from 'vue-class-component'

@Component({})
export default class extends Vue {
  render () {
    return (
      <button><slot/></button>
    )
  }
}
