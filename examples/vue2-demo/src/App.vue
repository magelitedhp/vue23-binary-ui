<template>
  <div>
    <h1>Vue2 沙盒</h1>
    <MyTinyButton @handleClick1="nishi">你是？？</MyTinyButton>
    <MyTinyRadio v-model="radio" label="1" @change="radioChange">你是？？</MyTinyRadio>
  </div>
</template>

<script>
export default {
  data() {
    return {
      radio: 0
    }
  },
  methods: {
    say() { 
      console.log(111222)  
    },
    nishi() {
      console.log(111)
    },
    radioChange(val) {
      console.log(val,'val',radio,'radio')
    }
  }
}
</script>