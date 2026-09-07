<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next'
import type { AdminSection } from '~/shared/types/admin'
import type { AboutPayload, AboutStat } from '~/shared/types/site'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · About',
  robots: 'noindex, nofollow',
})

// ADM-6: the about section's payload — bio, portrait and a dynamic stats list.
const toast = useToast()
const { data, error } = await useFetch<{ sections: AdminSection[] }>('/api/admin/sections')
const about = computed(() => data.value?.sections.find((s) => s.key === 'about') ?? null)

const form = reactive({ bio: '', portraitPath: '' })
const stats = ref<AboutStat[]>([])
const baseline = ref('')

function snapshot() {
  return JSON.stringify({ ...form, stats: stats.value })
}

function assign(section: AdminSection) {
  const payload = section.payload as AboutPayload
  form.bio = payload.bio ?? ''
  form.portraitPath = payload.portraitPath ?? ''
  stats.value = (payload.stats ?? []).map((stat) => ({ label: stat.label, value: stat.value }))
  baseline.value = snapshot()
}

if (about.value) assign(about.value)

const dirty = computed(() => snapshot() !== baseline.value)
useUnsavedGuard(dirty)

function addStat() {
  stats.value.push({ label: '', value: '' })
}

function removeStat(index: number) {
  stats.value.splice(index, 1)
}

const saving = ref(false)

async function save() {
  const section = about.value
  if (!section) return
  saving.value = true
  try {
    const payload = {
      ...section.payload,
      bio: form.bio,
      portraitPath: form.portraitPath,
      stats: stats.value
        .map((stat) => ({ label: stat.label.trim(), value: stat.value.trim() }))
        .filter((stat) => stat.label !== '' || stat.value !== ''),
    }
    await $fetch(`/api/admin/sections/${section.id}`, { method: 'PATCH', body: { payload } })
    baseline.value = snapshot()
    toast.success('About saved')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save about'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">About</h1>
      <p class="mt-1 text-sm text-base-content/70">
        The bio, portrait and quick stats shown in the about section.
      </p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load sections: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <div v-else-if="!about" class="alert alert-warning">
      <span>No section with key “about” exists — reseed the database.</span>
    </div>

    <form v-else class="max-w-xl space-y-4" @submit.prevent="save">
      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Bio</span></div>
        <textarea v-model="form.bio" class="textarea textarea-bordered w-full" rows="8" />
      </label>

      <AdminAssetPathInput v-model="form.portraitPath" label="Portrait path" />

      <fieldset class="space-y-3 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Stats</legend>
        <div v-for="(stat, index) in stats" :key="index" class="flex items-center gap-2">
          <input
            v-model="stat.label"
            type="text"
            class="input input-bordered input-sm min-w-0 flex-1"
            placeholder="Label, e.g. Years of experience"
            aria-label="Stat label"
          />
          <input
            v-model="stat.value"
            type="text"
            class="input input-bordered input-sm w-28 shrink-0"
            placeholder="5+"
            aria-label="Stat value"
          />
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-circle text-error"
            aria-label="Remove stat"
            @click="removeStat(index)"
          >
            <X class="size-4" aria-hidden="true" />
          </button>
        </div>
        <button type="button" class="btn btn-outline btn-sm gap-2" @click="addStat">
          <Plus class="size-4" aria-hidden="true" />
          Add stat
        </button>
      </fieldset>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save about
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
