<script setup lang="ts">
// Pre-paint theme application (PUB-4): stored choice wins, else prefers-color-scheme.
// Runs before first paint so there is no light/dark flash on load.
useHead({
  script: [
    {
      key: 'theme-init',
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t!=='portfolio'&&t!=='portfolio-dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'portfolio-dark':'portfolio'}}catch(e){t='portfolio'}document.documentElement.setAttribute('data-theme',t)})()`,
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>
