<template>
  <div id="stage" class="stage"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
    @mouseout="onMouseout"
    :style="cptSize">
    {{ this.render }}
  </div>
</template>

<script lang='ts' src='./index.ts'></script>
<style lang='less' scoped src='./index.less'></style>
