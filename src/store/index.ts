import Vue from 'vue'
import Vuex from 'vuex'

import editor from './modules/editor'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  modules: {
    editor
  },
  state: {
  },
  mutations: {
  }
})

export default store
