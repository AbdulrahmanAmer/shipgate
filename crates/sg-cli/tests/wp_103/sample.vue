<template>
  <h1>{{ title }}</h1>
  <div v-html="body"></div>
  <p>{{ safe }}</p>
</template>
<script setup lang="ts">
defineProps<{ title: string; body: string; safe: string }>()
</script>
