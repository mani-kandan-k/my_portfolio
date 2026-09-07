<script setup lang="ts">
// PUB-12: catch-all for unmatched public paths. Throws a fatal 404 so the themed
// error.vue renders it; real routes, /api, /_nuxt, /assets and /sitemap.xml are
// matched before this page and stay unaffected.
throw createError({
  statusCode: 404,
  statusMessage: 'Page not found',
  fatal: true,
})
</script>

<template>
  <div />
</template>
