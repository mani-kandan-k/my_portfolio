<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next'
import type { AdminSettings } from '~/shared/types/admin'
import type { PageSeoOverride } from '~/shared/types/site'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · SEO',
  robots: 'noindex, nofollow',
})

// ADM-13: default SEO fields plus per-page overrides keyed by path.
// Overrides are edited as rows and flattened into the seoOverrides map on save.
interface OverrideRow {
  path: string
  title: string
  description: string
  ogImagePath: string
}

const toast = useToast()
const { data, error } = await useFetch<{ settings: AdminSettings }>('/api/admin/settings')

const form = reactive({
  seoTitle: '',
  seoDescription: '',
  seoOgImagePath: '',
})
const rows = ref<OverrideRow[]>([])
const baseline = ref('')

function assign(settings: AdminSettings) {
  form.seoTitle = settings.seoTitle
  form.seoDescription = settings.seoDescription
  form.seoOgImagePath = settings.seoOgImagePath
  rows.value = Object.entries(settings.seoOverrides).map(([path, override]) => ({
    path,
    title: override.title ?? '',
    description: override.description ?? '',
    ogImagePath: override.ogImagePath ?? '',
  }))
  baseline.value = JSON.stringify({ ...form, rows: rows.value })
}

if (data.value?.settings) assign(data.value.settings)

const dirty = computed(() => JSON.stringify({ ...form, rows: rows.value }) !== baseline.value)
useUnsavedGuard(dirty)

function addRow() {
  rows.value.push({ path: '', title: '', description: '', ogImagePath: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

const saving = ref(false)

async function save() {
  const seoOverrides: Record<string, PageSeoOverride> = {}
  for (const row of rows.value) {
    const path = row.path.trim()
    if (!path) continue
    const override: PageSeoOverride = {}
    if (row.title.trim()) override.title = row.title.trim()
    if (row.description.trim()) override.description = row.description.trim()
    if (row.ogImagePath.trim()) override.ogImagePath = row.ogImagePath.trim()
    seoOverrides[path] = override
  }

  saving.value = true
  try {
    const res = await $fetch<{ settings: AdminSettings }>('/api/admin/settings', {
      method: 'PATCH',
      body: { ...form, seoOverrides },
    })
    assign(res.settings)
    toast.success('SEO settings saved')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save SEO settings'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">SEO</h1>
      <p class="mt-1 text-sm text-base-content/70">
        Default meta tags for the site, with per-page overrides for specific paths.
      </p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load settings: {{ error.statusMessage ?? error.message }}</span>
    </div>

    <form v-else class="space-y-6" @submit.prevent="save">
      <fieldset class="max-w-xl space-y-4 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Defaults</legend>

        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Default meta title</span></div>
          <input v-model="form.seoTitle" type="text" class="input input-bordered input-sm w-full" />
        </label>

        <label class="form-control w-full">
          <div class="label py-1"><span class="label-text">Default meta description</span></div>
          <textarea
            v-model="form.seoDescription"
            class="textarea textarea-bordered w-full"
            rows="3"
          />
        </label>

        <AdminAssetPathInput v-model="form.seoOgImagePath" label="Default OG image path" />
      </fieldset>

      <fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Per-page overrides</legend>

        <p v-if="rows.length === 0" class="text-sm text-base-content/60">
          No overrides yet — defaults apply everywhere.
        </p>

        <div
          v-for="(row, index) in rows"
          :key="index"
          class="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3"
        >
          <div class="flex items-end gap-2">
            <label class="form-control w-full max-w-xs">
              <div class="label py-1"><span class="label-text">Path</span></div>
              <input
                v-model="row.path"
                type="text"
                class="input input-bordered input-sm w-full font-mono"
                placeholder="/ or /projects/my-slug"
                spellcheck="false"
              />
            </label>
            <button
              type="button"
              class="btn btn-ghost btn-sm text-error"
              aria-label="Remove override"
              @click="removeRow(index)"
            >
              <X class="size-4" aria-hidden="true" />
              Remove
            </button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="form-control w-full">
              <div class="label py-1"><span class="label-text">Title</span></div>
              <input v-model="row.title" type="text" class="input input-bordered input-sm w-full" />
            </label>
            <label class="form-control w-full">
              <div class="label py-1"><span class="label-text">Description</span></div>
              <input
                v-model="row.description"
                type="text"
                class="input input-bordered input-sm w-full"
              />
            </label>
          </div>
          <AdminAssetPathInput v-model="row.ogImagePath" label="OG image path" />
        </div>

        <button type="button" class="btn btn-outline btn-sm gap-2" @click="addRow">
          <Plus class="size-4" aria-hidden="true" />
          Add override
        </button>
      </fieldset>

      <div class="flex items-center gap-3">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save SEO settings
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
