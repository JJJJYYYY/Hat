<template>
  <div class="editor full"
    :style="cptFullSize"
    tabindex="1"
    @keydown="onKeydown"
    @keyup="onKeyup"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup">
    <Stage>
      <Box/>
    </Stage>
  </div>
</template>

<script lang='ts' src='./index.ts'></script>
<style lang='less' scoped src='./index.less'></style>
