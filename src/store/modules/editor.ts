import Vue from 'vue'
import { Module } from 'vuex'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import { Size, HatElement, Coord, EleLocation } from '@/types/editor'

// let selected: HatElement[] = []

interface EditorState {
  window: Size,
  stage: Coord & Size,
  multiply: boolean,
  model: string,
  ratio: number, // scale
  selectedElements: HatElement[]
  elements: HatElement[]
}

const editor: Module<EditorState, any> = {
  state: {
    window: {
      width: 0,
      height: 0
    },
    stage: {
      x: 0,
      y: 0,
      width: 600,
      height: 600
    },
    multiply: false,
    model: MODEL.NONE,
    ratio: 1,
    elements: [],
    selectedElements: []
  },
  getters: {
    // selectedElements (state): EleBox[] {
    //   return state.boxIds && boxes
    // },
    // getElementCount (state): number {
    //   return state.elements.length
    // }
  },
  mutations: {
    // model: move, resize, select, multiply, null=''
    [TYPE.CHANGE_MODEL] (state: EditorState, model: string) {
      state.model = model
    },
    [TYPE.CHANGE_ELE] (state: EditorState, { change, i, changeState, context }) {
      change.call(context, state.elements[i], changeState)
    },
    [TYPE.UPDATE_ELE] (state: EditorState, newEle: HatElement) {
      const ele = state.elements.find(e => e.id === newEle.id)!

      ele.attrs.x = newEle.attrs.x
      ele.attrs.y = newEle.attrs.y
      ele.attrs.width = newEle.attrs.width
      ele.attrs.height = newEle.attrs.height
      ele.onMove = newEle.onMove
      ele.onScale = newEle.onScale
      ele.onRotate = newEle.onRotate
      ele.onCommit = newEle.onCommit
    },
    [TYPE.PRESS_MULTIPLY] (state: EditorState, press: boolean) {
      state.multiply = press
    },
    [TYPE.RESIZE_WINDOW] (state: EditorState, { width, height }: Size) {
      state.window.width = width
      state.window.height = height
    },
    [TYPE.STAGE_CHANGE] (state: EditorState, { x, y }: Coord) {
      state.stage.x = x
      state.stage.y = y
    },
    [MODEL.MULTIPLY] (state: EditorState, ele: HatElement) {
      if (!state.selectedElements.includes(ele)) {
        state.selectedElements.push(ele)
      }
    },
    [MODEL.SELECT] (state: EditorState, ele: HatElement) {
      state.selectedElements = [ele]
    },
    [MODEL.CANCEL] (state: EditorState, ele: HatElement) {
      state.selectedElements = state.selectedElements.filter(select => select !== ele)
    },
    [MODEL.CLEAR] (state: EditorState) {
      state.selectedElements = []
    },
    [TYPE.ADD_ELE] (state: EditorState, ele: HatElement) {
      state.elements.push(ele)
    },
    [TYPE.SCALE_RADIO] (state: EditorState, ratio: number) {
      state.ratio = ratio
    }
  },
  actions: {
    selectBox ({ commit, state }, ele?: HatElement) {
      if (ele) {
        if (state.multiply && state.selectedElements.includes(ele)) {
          commit(MODEL.CANCEL, ele)
        } else {
          commit(state.multiply ? MODEL.MULTIPLY : MODEL.SELECT, ele)
        }
      } else {
        commit(MODEL.CLEAR)
      }
      console.log(ele)
    },
    pressMultiply ({ commit, state }, press: boolean) {
      commit(TYPE.PRESS_MULTIPLY, press)
      // press
      //   ? commit(TYPE.PRESS_MULTIPLY, true)
      //   : setTimeout(() => commit(TYPE.PRESS_MULTIPLY, false), 600)
    }
  }
}

export default editor
