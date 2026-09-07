<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mb-10">
    <h2 class="text-3xl font-bold tracking-tight">{{ title }}</h2>
    <p v-if="subtitle" class="mt-2 text-base-content/60">{{ subtitle }}</p>
  </div>
</template>
