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
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface Attribute {
      [elem: string]: any
    }
  }
}

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

// prevent contextmenu
document.addEventListener('contextmenu', (e: MouseEvent) => {
  e.preventDefault()
})

function resizeWindow () {
  app.$store.commit(TYPE.RESIZE_WINDOW, {
    width: window.innerWidth,
    height: window.innerHeight
  })
}
// window reset
window.addEventListener('resize', resizeWindow)
window.addEventListener('load', resizeWindow)
