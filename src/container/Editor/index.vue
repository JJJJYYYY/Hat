<template>
<div class="editor full"
  tabindex="1"
  :style="cptFullSize"
  @keydown="onKeydown"
  @keyup="onKeyup"
  @mousedown="onMousedown"
  @mousemove="onMousemove"
  @mouseup="onMouseup">
  <Stage />
  <a @click='onChangeModel(MODEL_PEN)'>pen</a>
</div>
</template>

<script lang='ts' src='./index.ts'></script>
<style lang='less' scoped src='./index.less'></style>
