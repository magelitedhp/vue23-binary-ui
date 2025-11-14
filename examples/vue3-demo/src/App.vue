<template>
  <h1>Vue3 沙盒</h1>
  <MyButton @click="say">点我</MyButton>
  <MyTinyButton type="primary" @click="say">点我</MyTinyButton>
  <MyElButton type="primary" @click="say">点我el</MyElButton>
  <MyElButton1 type="primary" @click="say">点我el1111111111</MyElButton1>
  <div>
    <el-button @click="handleClick">sasa</el-button>
  </div>
</template>

<script setup>
const say = () => alert('Hello Vue3')
</script>
<style>
</style>