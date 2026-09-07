<script setup lang="ts">
import { CircleCheck, CircleX, X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast toast-end z-50">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="alert shadow-lg"
      :class="toast.kind === 'success' ? 'alert-success' : 'alert-error'"
      role="status"
    >
      <CircleCheck v-if="toast.kind === 'success'" class="size-5 shrink-0" aria-hidden="true" />
      <CircleX v-else class="size-5 shrink-0" aria-hidden="true" />
      <span class="text-sm">{{ toast.message }}</span>
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-circle"
        aria-label="Dismiss notification"
        @click="dismiss(toast.id)"
      >
        <X class="size-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
