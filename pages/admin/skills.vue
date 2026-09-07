<script setup lang="ts">
import { Pencil, Plus } from 'lucide-vue-next'
import { skillCreateSchema } from '~/shared/schemas/skill'
import type { AdminSkill } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Skills',
  robots: 'noindex, nofollow',
})

// ADM-7: skills CRUD — drag to reorder, add/edit via modal, two-step delete.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ skills: AdminSkill[] }>(
  '/api/admin/skills',
)
const items = ref<AdminSkill[]>([])
watch(
  data,
  (d) => {
    if (d) items.value = d.skills.map((skill) => ({ ...skill }))
  },
  { immediate: true },
)

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({ name: '', icon: '', category: 'General', proficiency: 3 })
const formBaseline = ref('')
const modalDirty = computed(() => JSON.stringify(form) !== formBaseline.value)
useUnsavedGuard(modalDirty)

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', icon: '', category: 'General', proficiency: 3 })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function openEdit(item: AdminSkill) {
  editingId.value = item.id
  Object.assign(form, {
    name: item.name,
    icon: item.icon,
    category: item.category,
    proficiency: item.proficiency,
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
  const parsed = skillCreateSchema.safeParse({ ...form })
  if (!parsed.success) {
    modalError.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    return
  }
  saving.value = true
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/skills', { method: 'POST', body: parsed.data })
    } else {
      await $fetch(`/api/admin/skills/${editingId.value}`, { method: 'PATCH', body: parsed.data })
    }
    toast.success(editingId.value === null ? 'Skill added' : 'Skill updated')
    modalOpen.value = false
    await refresh()
  } catch (err) {
    modalError.value = apiErrorMessage(err, 'Failed to save skill')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    toast.success('Skill deleted')
    await refresh()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete skill'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(items.value.map((skill) => [skill.id, skill]))
  items.value = ids.flatMap((id) => {
    const skill = byId.get(id)
    return skill ? [skill] : []
  })
  try {
    await $fetch('/api/admin/skills/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder skills'))
    await refresh()
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Skills</h1>
        <p class="mt-1 text-sm text-base-content/70">The technologies listed on the site.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreate">
        <Plus class="size-4" aria-hidden="true" />
        Add skill
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading skills" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load skills: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <p v-else-if="items.length === 0" class="text-sm text-base-content/60">
      No skills yet — add the first one.
    </p>

    <AdminSortableList v-else :items="items" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ item.name }}</span>
            <span class="badge badge-outline badge-sm ml-2">{{ item.category }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-1" :aria-label="`Proficiency ${item.proficiency} of 5`">
            <span
              v-for="i in 5"
              :key="i"
              class="size-2 rounded-full"
              :class="i <= item.proficiency ? 'bg-primary' : 'bg-base-300'"
              aria-hidden="true"
            />
            <span class="ml-1 text-xs tabular-nums text-base-content/50">{{ item.proficiency }}/5</span>
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
      :title="editingId === null ? 'Add skill' : 'Edit skill'"
      :loading="saving"
      @close="requestClose"
      @save="save"
    >
      <p v-if="modalError" class="alert alert-error py-2 text-sm">{{ modalError }}</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Name *</span></div>
          <input v-model="form.name" type="text" class="input input-bordered input-sm w-full" />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Category</span></div>
          <input v-model="form.category" type="text" class="input input-bordered input-sm w-full" />
        </label>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Icon name</span></div>
          <input
            v-model="form.icon"
            type="text"
            class="input input-bordered input-sm w-full font-mono"
            placeholder="e.g. typescript"
            spellcheck="false"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Proficiency</span></div>
          <select v-model.number="form.proficiency" class="select select-bordered select-sm w-full">
            <option v-for="level in 5" :key="level" :value="level">{{ level }} / 5</option>
          </select>
        </label>
      </div>
    </AdminFormModal>
  </section>
</template>
