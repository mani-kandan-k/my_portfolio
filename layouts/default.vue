<template>
  <div class="flex min-h-screen flex-col bg-base-100 text-base-content">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppToasts />
  </div>
</template>
