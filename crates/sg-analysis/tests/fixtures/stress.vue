<template>
  <div id="app" :class="{ active: isActive }" @click="go($event)">
    <ul>
      <li v-for="(item, i) in items" :key="item.id">{{ item.name }}</li>
    </ul>
    <MyComp v-model="val" #header="{ slot }" />
    <p v-if="ok">yes</p><p v-else>no</p>
    <div v-html="body"></div>
    <span v-html="intro + more" class="x"></span>
    <input v-bind:value="v" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const isActive = ref(true)
</script>
<style scoped lang="scss">
.a { .b { color: red } }
</style>
