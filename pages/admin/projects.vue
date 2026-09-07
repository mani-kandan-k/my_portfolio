<script setup lang="ts">
import { Pencil, Plus, Star } from 'lucide-vue-next'
import { projectCreateSchema } from '~/shared/schemas/project'
import type { AdminProject } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Projects',
  robots: 'noindex, nofollow',
})

// ADM-9: projects CRUD — drag to reorder, add/edit via modal, two-step delete.
// The slug is auto-suggested from the title while creating, until the user
// edits it manually; a duplicate slug surfaces the server's 409 inline.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ projects: AdminProject[] }>(
  '/api/admin/projects',
)
const items = ref<AdminProject[]>([])
watch(
  data,
  (d) => {
    if (d) items.value = d.projects.map((project) => ({ ...project }))
  },
  { immediate: true },
)

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')
const editingId = ref<number | null>(null)
const slugEdited = ref(false)
const form = reactive({
  title: '',
  slug: '',
  summary: '',
  description: '',
  heroImagePath: '',
  techText: '',
  repoUrl: '',
  liveUrl: '',
  featured: false,
})
const formBaseline = ref('')
const modalDirty = computed(() => JSON.stringify(form) !== formBaseline.value)
useUnsavedGuard(modalDirty)

function kebab(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(
  () => form.title,
  (title) => {
    if (editingId.value !== null || slugEdited.value) return
    form.slug = kebab(title)
  },
)

function openCreate() {
  editingId.value = null
  slugEdited.value = false
  Object.assign(form, {
    title: '',
    slug: '',
    summary: '',
    description: '',
    heroImagePath: '',
    techText: '',
    repoUrl: '',
    liveUrl: '',
    featured: false,
  })
  formBaseline.value = JSON.stringify(form)
  modalError.value = ''
  modalOpen.value = true
}

function openEdit(item: AdminProject) {
  editingId.value = item.id
  Object.assign(form, {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    description: item.description,
    heroImagePath: item.heroImagePath,
    techText: item.tech.join(', '),
    repoUrl: item.repoUrl,
    liveUrl: item.liveUrl,
    featured: item.featured,
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
  const parsed = projectCreateSchema.safeParse({
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    description: form.description,
    heroImagePath: form.heroImagePath,
    tech: form.techText
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== ''),
    repoUrl: form.repoUrl.trim(),
    liveUrl: form.liveUrl.trim(),
    featured: form.featured,
  })
  if (!parsed.success) {
    modalError.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    return
  }
  saving.value = true
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/projects', { method: 'POST', body: parsed.data })
    } else {
      await $fetch(`/api/admin/projects/${editingId.value}`, { method: 'PATCH', body: parsed.data })
    }
    toast.success(editingId.value === null ? 'Project added' : 'Project updated')
    modalOpen.value = false
    await refresh()
  } catch (err) {
    // 409 slug conflicts land here as "Slug is already taken".
    modalError.value = apiErrorMessage(err, 'Failed to save project')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    toast.success('Project deleted')
    await refresh()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete project'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(items.value.map((project) => [project.id, project]))
  items.value = ids.flatMap((id) => {
    const project = byId.get(id)
    return project ? [project] : []
  })
  try {
    await $fetch('/api/admin/projects/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder projects'))
    await refresh()
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Projects</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Projects shown on the site; each one gets a detail page at /projects/&lt;slug&gt;.
        </p>
      </div>
      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreate">
        <Plus class="size-4" aria-hidden="true" />
        Add project
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading projects" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load projects: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <p v-else-if="items.length === 0" class="text-sm text-base-content/60">
      No projects yet — add the first one.
    </p>

    <AdminSortableList v-else :items="items" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ item.title }}</span>
            <span class="badge badge-outline badge-sm ml-2 font-mono">{{ item.slug }}</span>
            <Star
              v-if="item.featured"
              class="ml-1 inline size-4 fill-accent text-accent"
              aria-label="Featured project"
            />
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
      :title="editingId === null ? 'Add project' : 'Edit project'"
      :loading="saving"
      @close="requestClose"
      @save="save"
    >
      <p v-if="modalError" class="alert alert-error py-2 text-sm">{{ modalError }}</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Title *</span></div>
          <input v-model="form.title" type="text" class="input input-bordered input-sm w-full" />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Slug *</span></div>
          <input
            v-model="form.slug"
            type="text"
            class="input input-bordered input-sm w-full font-mono"
            placeholder="my-project"
            spellcheck="false"
            @input="slugEdited = true"
          />
        </label>
      </div>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Summary</span></div>
        <textarea v-model="form.summary" class="textarea textarea-bordered w-full" rows="2" />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Description</span></div>
        <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="5" />
      </label>

      <AdminAssetPathInput v-model="form.heroImagePath" label="Hero image path" />

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Tech — comma-separated</span></div>
        <input
          v-model="form.techText"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Nuxt 3, Tailwind CSS"
        />
      </label>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Repository URL</span></div>
          <input
            v-model="form.repoUrl"
            type="text"
            class="input input-bordered input-sm w-full font-mono"
            placeholder="https://github.com/…"
            spellcheck="false"
          />
        </label>
        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Live URL</span></div>
          <input
            v-model="form.liveUrl"
            type="text"
            class="input input-bordered input-sm w-full font-mono"
            placeholder="https://…"
            spellcheck="false"
          />
        </label>
      </div>

      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input v-model="form.featured" type="checkbox" class="checkbox checkbox-sm" />
        Featured project
      </label>
    </AdminFormModal>
  </section>
</template>
