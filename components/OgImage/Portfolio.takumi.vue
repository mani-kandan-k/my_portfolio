<script setup lang="ts">
// 8.2 (PUB-6): generated OG card, used only when no static OG image is
// configured (settings default or per-page override wins when set). Rendered
// server-side by nuxt-og-image — keep to the renderer's CSS subset (flex
// layout; dynamic colors via inline style).
withDefaults(
  defineProps<{
    title?: string
    description?: string
    themeColor?: string
  }>(),
  {
    title: 'Portfolio',
    description: '',
    themeColor: '#3b82f6',
  },
)
</script>

<template>
  <div class="flex h-full w-full flex-col justify-center gap-6 bg-neutral-900 p-16 text-white">
    <div class="h-2 w-24 rounded-full" :style="{ backgroundColor: themeColor }" />
    <div class="text-6xl font-extrabold tracking-tight">{{ title }}</div>
    <div v-if="description" class="max-w-4xl text-2xl leading-snug text-neutral-400">
      {{ description }}
    </div>
  </div>
</template>
