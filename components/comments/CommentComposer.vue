<script setup lang="ts">
import { Send } from 'lucide-vue-next'
import type { CommentItem } from '~/shared/types/engagement'

// ENG-2/5: signed-in composer — 1–1000 chars, live counter, disabled while
// invalid or in flight. Rate-limit (429) and validation errors surface via toast.
const props = defineProps<{ slug: string }>()
const emit = defineEmits<{ posted: [comment: CommentItem] }>()

const toast = useToast()
const body = ref('')
const sending = ref(false)

const length = computed(() => body.value.length)
const canSubmit = computed(
  () => body.value.trim().length > 0 && length.value <= 1000 && !sending.value,
)

async function submit() {
  if (!canSubmit.value) return
  sending.value = true
  try {
    const res = await $fetch<{ comment: CommentItem }>(
      `/api/projects/${encodeURIComponent(props.slug)}/comments`,
      { method: 'POST', body: { body: body.value } },
    )
    emit('posted', res.comment)
    body.value = ''
    toast.success('Comment posted')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Failed to post comment'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="space-y-2" @submit.prevent="submit">
    <label class="form-control w-full">
      <textarea
        v-model="body"
        class="textarea textarea-bordered w-full"
        rows="3"
        maxlength="1000"
        placeholder="Write a comment…"
        aria-label="Comment body"
      />
    </label>
    <div class="flex items-center justify-between">
      <span class="text-xs" :class="length > 1000 ? 'text-error' : 'text-base-content/50'">
        {{ length }}/1000
      </span>
      <button type="submit" class="btn btn-primary btn-sm gap-2" :disabled="!canSubmit">
        <span v-if="sending" class="loading loading-spinner loading-xs" aria-hidden="true" />
        <Send v-else class="size-3.5" aria-hidden="true" />
        Post comment
      </button>
    </div>
  </form>
</template>
