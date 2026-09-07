<script setup lang="ts">
import { Pencil, Plus } from 'lucide-vue-next'
import { experienceCreateSchema } from '~/shared/schemas/experience'
import type { AdminExperience } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Experience',
  robots: 'noindex, nofollow',
})

// ADM-8: experience CRUD — drag to reorder, add/edit via modal, two-step delete.
// Bullets edit one-per-line in a textarea; tech edits comma-separated; the
// "Current" checkbox maps to endDate = null.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ experience: AdminExperience[] }>(
  '/api/admin/experience',
)
const items = ref<AdminExperience[]>([])
watch(
  data,
  (d) => {
    if (d) items.value = d.experience.map((entry) => ({ ...entry }))
  },
  { immediate: true },
)

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  bulletsText: '',
  techText: '',
  logoPath: '',
})
const formBaseline = ref('')
const modalDirty = computed(() => JSON.stringify(form) !== formBaseline.value)
useUnsavedGuard(modalDirty)

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bulletsText: '',
    techText: '',
    logoPath: '',
  })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function openEdit(item: AdminExperience) {
  editingId.value = item.id
  Object.assign(form, {
    company: item.company,
    role: item.role,
    location: item.location,
    startDate: item.startDate,
    endDate: item.endDate ?? '',
    current: item.endDate === null,
    bulletsText: item.bullets.join('\n'),
    techText: item.tech.join(', '),
    logoPath: item.logoPath,
  })
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
  const parsed = experienceCreateSchema.safeParse({
    company: form.company,
    role: form.role,
    location: form.location,
    startDate: form.startDate,
    endDate: form.current ? null : form.endDate.trim() || null,
    bullets: form.bulletsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== ''),
    tech: form.techText
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== ''),
    logoPath: form.logoPath,
  })
  if (!parsed.success) {
    modalError.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    return
  }
  saving.value = true
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/experience', { method: 'POST', body: parsed.data })
    } else {
      await $fetch(`/api/admin/experience/${editingId.value}`, {
        method: 'PATCH',
        body: parsed.data,
      })
    }
    toast.success(editingId.value === null ? 'Experience added' : 'Experience updated')
    modalOpen.value = false
    await refresh()
  } catch (err) {
    modalError.value = apiErrorMessage(err, 'Failed to save experience')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/experience/${id}`, { method: 'DELETE' })
    toast.success('Experience deleted')
    await refresh()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete experience'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(items.value.map((entry) => [entry.id, entry]))
  items.value = ids.flatMap((id) => {
    const entry = byId.get(id)
    return entry ? [entry] : []
  })
  try {
    await $fetch('/api/admin/experience/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder experience'))
    await refresh()
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Experience</h1>
        <p class="mt-1 text-sm text-base-content/70">Roles shown in the experience section.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreate">
        <Plus class="size-4" aria-hidden="true" />
        Add experience
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading experience" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load experience: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <p v-else-if="items.length === 0" class="text-sm text-base-content/60">
      No experience entries yet — add the first one.
    </p>

    <AdminSortableList v-else :items="items" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ item.role }}</span>
            <span class="text-base-content/60"> @ {{ item.company }}</span>
            <span class="ml-2 text-xs tabular-nums text-base-content/50">
              {{ item.startDate }} – {{ item.endDate ?? 'Present' }}
            </span>
          </span>
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
      :title="editingId === null ? 'Add experience' : 'Edit experience'"
      :loading="saving"
      @close="requestClose"
      @save="save"
    >
      <p v-if="modalError" class="alert alert-error py-2 text-sm">{{ modalError }}</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Company *</span></div>
          <input v-model="form.company" type="text" class="input input-bordered input-sm w-full" />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Role *</span></div>
          <input v-model="form.role" type="text" class="input input-bordered input-sm w-full" />
        </label>
      </div>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Location</span></div>
        <input v-model="form.location" type="text" class="input input-bordered input-sm w-full" />
      </label>

      <div class="grid items-end gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Start date *</span></div>
          <input
            v-model="form.startDate"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="2023-01"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">End date</span></div>
          <input
            v-model="form.endDate"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="2024-06"
            :disabled="form.current"
          />
        </label>
      </div>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input v-model="form.current" type="checkbox" class="checkbox checkbox-sm" />
        Current role (no end date)
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Bullets — one per line</span></div>
        <textarea v-model="form.bulletsText" class="textarea textarea-bordered w-full" rows="4" />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Tech — comma-separated</span></div>
        <input
          v-model="form.techText"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Go, Vue, PostgreSQL"
        />
      </label>

      <AdminAssetPathInput v-model="form.logoPath" label="Company logo path" />
    </AdminFormModal>
  </section>
</template>
