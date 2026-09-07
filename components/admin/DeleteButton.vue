<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

// Two-step delete: first click arms the "Confirm?" state for ~3s, second click
// emits `confirm`. Keeps destructive clicks inline instead of a modal.
withDefaults(defineProps<{ label?: string }>(), { label: 'Delete' })
const emit = defineEmits<{ confirm: [] }>()

const armed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function onClick() {
  if (armed.value) {
    clearTimeout(timer)
    armed.value = false
    emit('confirm')
    return
  }
  armed.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    armed.value = false
  }, 3000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    class="btn btn-xs"
    :class="armed ? 'btn-error' : 'btn-ghost text-error'"
    @click="onClick"
  >
    <Trash2 class="size-3.5" aria-hidden="true" />
    {{ armed ? 'Confirm?' : label }}
  </button>
</template>
