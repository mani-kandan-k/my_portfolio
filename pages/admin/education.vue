<script setup lang="ts">
import { Pencil, Plus } from 'lucide-vue-next'
import { educationCreateSchema } from '~/shared/schemas/education'
import type { AdminEducation } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Education',
  robots: 'noindex, nofollow',
})

// ADM-10: education CRUD — drag to reorder, add/edit via modal, two-step delete.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ education: AdminEducation[] }>(
  '/api/admin/education',
)
const items = ref<AdminEducation[]>([])
watch(
  data,
  (d) => {
    if (d) items.value = d.education.map((entry) => ({ ...entry }))
  },
  { immediate: true },
)

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({
  institution: '',
  degree: '',
  startDate: '',
  endDate: '',
  current: false,
  notes: '',
})
const formBaseline = ref('')
const modalDirty = computed(() => JSON.stringify(form) !== formBaseline.value)
useUnsavedGuard(modalDirty)

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    current: false,
    notes: '',
  })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function openEdit(item: AdminEducation) {
  editingId.value = item.id
  Object.assign(form, {
    institution: item.institution,
    degree: item.degree,
    startDate: item.startDate,
    endDate: item.endDate ?? '',
    current: item.endDate === null,
    notes: item.notes,
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
  const parsed = educationCreateSchema.safeParse({
    institution: form.institution,
    degree: form.degree,
    startDate: form.startDate,
    endDate: form.current ? null : form.endDate.trim() || null,
    notes: form.notes,
  })
  if (!parsed.success) {
    modalError.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    return
  }
  saving.value = true
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/education', { method: 'POST', body: parsed.data })
    } else {
      await $fetch(`/api/admin/education/${editingId.value}`, {
        method: 'PATCH',
        body: parsed.data,
      })
    }
    toast.success(editingId.value === null ? 'Education added' : 'Education updated')
    modalOpen.value = false
    await refresh()
  } catch (err) {
    modalError.value = apiErrorMessage(err, 'Failed to save education')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/education/${id}`, { method: 'DELETE' })
    toast.success('Education deleted')
    await refresh()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete education'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(items.value.map((entry) => [entry.id, entry]))
  items.value = ids.flatMap((id) => {
    const entry = byId.get(id)
    return entry ? [entry] : []
  })
  try {
    await $fetch('/api/admin/education/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder education'))
    await refresh()
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Education</h1>
        <p class="mt-1 text-sm text-base-content/70">Degrees and schools in the education section.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreate">
        <Plus class="size-4" aria-hidden="true" />
        Add education
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading education" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load education: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <p v-else-if="items.length === 0" class="text-sm text-base-content/60">
      No education entries yet — add the first one.
    </p>

    <AdminSortableList v-else :items="items" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ item.degree }}</span>
            <span class="text-base-content/60"> — {{ item.institution }}</span>
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
      :title="editingId === null ? 'Add education' : 'Edit education'"
      :loading="saving"
      @close="requestClose"
      @save="save"
    >
      <p v-if="modalError" class="alert alert-error py-2 text-sm">{{ modalError }}</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Institution *</span></div>
          <input
            v-model="form.institution"
            type="text"
            class="input input-bordered input-sm w-full"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Degree *</span></div>
          <input v-model="form.degree" type="text" class="input input-bordered input-sm w-full" />
        </label>
      </div>

      <div class="grid items-end gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Start date *</span></div>
          <input
            v-model="form.startDate"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="2018"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">End date</span></div>
          <input
            v-model="form.endDate"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="2022"
            :disabled="form.current"
          />
        </label>
      </div>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input v-model="form.current" type="checkbox" class="checkbox checkbox-sm" />
        Ongoing (no end date)
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Notes</span></div>
        <textarea v-model="form.notes" class="textarea textarea-bordered w-full" rows="3" />
      </label>
    </AdminFormModal>
  </section>
</template>
