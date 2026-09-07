<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

// error.vue replaces app.vue, so re-apply the pre-paint theme script here too
// (same logic as app.vue) to avoid a light/dark flash on error pages.
useHead({
  script: [
    {
      key: 'theme-init',
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t!=='portfolio'&&t!=='portfolio-dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'portfolio-dark':'portfolio'}}catch(e){t='portfolio'}document.documentElement.setAttribute('data-theme',t)})()`,
    },
  ],
})

function handleHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-100 px-4 text-center text-base-content"
  >
    <h1 class="text-6xl font-bold text-primary">{{ error.statusCode }}</h1>
    <p class="max-w-md text-base-content/70">
      {{ error.message || error.statusMessage || 'Something went wrong.' }}
    </p>
    <div class="flex gap-2">
      <button type="button" class="btn btn-primary btn-sm" @click="handleHome">Back to home</button>
      <a
        v-if="error.statusCode === 401"
        href="/api/auth/github"
        rel="nofollow"
        class="btn btn-outline btn-sm"
      >
        Sign in with GitHub
      </a>
    </div>
  </div>
</template>
