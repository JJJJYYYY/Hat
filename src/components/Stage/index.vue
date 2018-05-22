<template>
  <svg
    version="1.1" baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    id="stage" class="stage"
    :width='width'
    :height='height'
    :style='cptSize'
    @click.self="onClick">
    <slot></slot>
  </svg>
</template>

<script lang='ts' src='./index.ts'></script>
<style lang='less' scoped src='./index.less'></style>
