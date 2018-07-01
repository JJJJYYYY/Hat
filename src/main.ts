// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue, { VNode } from 'vue'

import App from './App'
import router from './router'
import store from './store'

import { TYPE } from '@/enum/store'

Vue.config.productionTip = true

declare global {
  namespace JSX {
    interface HatElement extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface Attribute {
      [key: string]: any
    }
  }
}

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
    // prevent contextmenu
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
    })
  }
})
