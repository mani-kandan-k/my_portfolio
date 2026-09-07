<script setup lang="ts">
// Shared daisyUI modal shell for the admin CRUD forms. The parent owns the form
// state and decides (via its `close` handler) whether closing needs a confirm.
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    loading?: boolean
    saveLabel?: string
  }>(),
  { loading: false, saveLabel: 'Save' },
)
const emit = defineEmits<{
  close: []
  save: []
}>()

if (import.meta.client) {
  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.open && !props.loading) emit('close')
  })
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }" aria-modal="true" :aria-label="title">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <form class="mt-4 space-y-4" @submit.prevent="emit('save')">
        <slot />
        <div class="modal-action">
          <slot name="footer">
            <button type="button" class="btn btn-ghost" :disabled="loading" @click="emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-xs" aria-hidden="true" />
              {{ saveLabel }}
            </button>
          </slot>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="emit('close')">
      <button type="submit" aria-label="Close dialog">close</button>
    </form>
  </dialog>
</template>
