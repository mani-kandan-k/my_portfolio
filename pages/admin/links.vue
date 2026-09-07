<script setup lang="ts">
import { Pencil, Plus } from 'lucide-vue-next'
import { socialLinkCreateSchema } from '~/shared/schemas/socialLink'
import type { AdminLink } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Links',
  robots: 'noindex, nofollow',
})

// ADM-11: social links CRUD — drag to reorder, add/edit via modal, two-step delete.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ links: AdminLink[] }>('/api/admin/links')
const items = ref<AdminLink[]>([])
watch(
  data,
  (d) => {
    if (d) items.value = d.links.map((link) => ({ ...link }))
  },
  { immediate: true },
)

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({ label: '', url: '', icon: '' })
const formBaseline = ref('')
const modalDirty = computed(() => JSON.stringify(form) !== formBaseline.value)
useUnsavedGuard(modalDirty)

function openCreate() {
  editingId.value = null
  Object.assign(form, { label: '', url: '', icon: '' })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function openEdit(item: AdminLink) {
  editingId.value = item.id
  Object.assign(form, { label: item.label, url: item.url, icon: item.icon })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function requestClose() {
  if (modalDirty.value && !window.confirm('Discard unsaved changes?')) return
  modalOpen.value = false
}

async function save() {
  modalError.value = ''
  const parsed = socialLinkCreateSchema.safeParse({ ...form })
  if (!parsed.success) {
    modalError.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    return
  }
  saving.value = true
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/links', { method: 'POST', body: parsed.data })
    } else {
      await $fetch(`/api/admin/links/${editingId.value}`, { method: 'PATCH', body: parsed.data })
    }
    toast.success(editingId.value === null ? 'Link added' : 'Link updated')
    modalOpen.value = false
    await refresh()
  } catch (err) {
    modalError.value = apiErrorMessage(err, 'Failed to save link')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/links/${id}`, { method: 'DELETE' })
    toast.success('Link deleted')
    await refresh()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete link'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(items.value.map((link) => [link.id, link]))
  items.value = ids.flatMap((id) => {
    const link = byId.get(id)
    return link ? [link] : []
  })
  try {
    await $fetch('/api/admin/links/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder links'))
    await refresh()
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Links</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Social links shown in the contact section and footer.
        </p>
      </div>
      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreate">
        <Plus class="size-4" aria-hidden="true" />
        Add link
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading links" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load links: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <p v-else-if="items.length === 0" class="text-sm text-base-content/60">
      No links yet — add the first one.
    </p>

    <AdminSortableList v-else :items="items" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ item.label }}</span>
            <span class="ml-2 break-all font-mono text-xs text-base-content/60">{{ item.url }}</span>
          </span>
          <span v-if="item.icon" class="badge badge-outline badge-sm shrink-0">{{ item.icon }}</span>
          <button type="button" class="btn btn-ghost btn-xs gap-1" @click="openEdit(item)">
            <Pencil class="size-3.5" aria-hidden="true" />
            Edit
          </button>
          <AdminDeleteButton @confirm="remove(item.id)" />
        </div>
      </template>
    </AdminSortableList>

    <AdminFormModal
      :open="modalOpen"
      :title="editingId === null ? 'Add link' : 'Edit link'"
      :loading="saving"
      @close="requestClose"
      @save="save"
    >
      <p v-if="modalError" class="alert alert-error py-2 text-sm">{{ modalError }}</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Label *</span></div>
          <input
            v-model="form.label"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="GitHub"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Icon name</span></div>
          <input
            v-model="form.icon"
            type="text"
            class="input input-bordered input-sm w-full font-mono"
            placeholder="e.g. github"
            spellcheck="false"
          />
        </label>
      </div>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">URL *</span></div>
        <input
          v-model="form.url"
          type="text"
          class="input input-bordered input-sm w-full font-mono"
          placeholder="https://… or mailto:…"
          spellcheck="false"
        />
      </label>
    </AdminFormModal>
  </section>
</template>
