<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
import { assetPath } from '~/shared/schemas/common'

// ADM-14: asset field — a path under /assets/, or an image uploaded to the
// Media table via the Upload button (stored in the DB, served at /api/media/<id>).
// Debounced existence check against /api/admin/assets; inline preview for images.
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
  }>(),
  { label: 'Asset path' },
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|svg|webp|avif)$/i
const UPLOAD_MAX_BYTES = 2 * 1024 * 1024
const UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif'

const toast = useToast()
const checking = ref(false)
const exists = ref<boolean | null>(null)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const isValid = computed(
  () => props.modelValue === '' || assetPath.safeParse(props.modelValue).success,
)
const showPreview = computed(
  () =>
    props.modelValue !== '' &&
    isValid.value &&
    (IMAGE_EXTENSION.test(props.modelValue) || props.modelValue.startsWith('/api/media/')),
)

async function check(path: string) {
  if (!path || !assetPath.safeParse(path).success) {
    exists.value = null
    return
  }
  checking.value = true
  try {
    const res = await $fetch<{ exists: boolean }>('/api/admin/assets', { query: { path } })
    exists.value = res.exists
  } catch {
    exists.value = null
  } finally {
    checking.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    clearTimeout(debounceTimer)
    if (!import.meta.client || value === '') {
      exists.value = null
      return
    }
    debounceTimer = setTimeout(() => check(value), 400)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(debounceTimer))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

async function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-picking the same file
  if (!file) return

  if (!UPLOAD_ACCEPT.split(',').includes(file.type)) {
    toast.error('Only PNG, JPEG, WebP, AVIF or GIF images are allowed')
    return
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    toast.error('Image is too large — 2 MB max')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ id: number; url: string }>('/api/admin/media', {
      method: 'POST',
      body: formData,
    })
    emit('update:modelValue', res.url)
    toast.success('Image uploaded')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Failed to upload image'))
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <label class="form-control w-full">
    <div class="label py-1">
      <span class="label-text">{{ label }}</span>
    </div>
    <div class="flex items-center gap-2">
      <input
        type="text"
        class="input input-bordered input-sm w-full font-mono"
        :value="modelValue"
        placeholder="/assets/example.png"
        spellcheck="false"
        @input="onInput"
      />
      <button
        type="button"
        class="btn btn-outline btn-sm shrink-0 gap-1.5"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        <span v-if="uploading" class="loading loading-spinner loading-xs" aria-hidden="true" />
        <Upload v-else class="size-3.5" aria-hidden="true" />
        {{ uploading ? 'Uploading…' : 'Upload' }}
      </button>
      <input
        ref="fileInput"
        type="file"
        :accept="UPLOAD_ACCEPT"
        class="hidden"
        aria-hidden="true"
        tabindex="-1"
        @change="onFilePicked"
      />
    </div>
    <div class="label py-1">
      <span v-if="modelValue === ''" class="label-text-alt text-base-content/50">
        Leave empty, give a path under /assets/, or upload an image (2 MB max)
      </span>
      <span v-else-if="!isValid" class="label-text-alt text-error">
        Must be a path under /assets/ or an uploaded image URL
      </span>
      <span v-else-if="checking" class="label-text-alt text-base-content/50">Checking…</span>
      <span v-else-if="exists === true" class="label-text-alt text-success">✓ Found</span>
      <span v-else-if="exists === false" class="label-text-alt text-error">✗ Not found</span>
    </div>
    <img
      v-if="showPreview"
      :src="modelValue"
      alt="Asset preview"
      class="h-16 w-auto rounded border border-base-300 object-contain"
    />
  </label>
</template>
