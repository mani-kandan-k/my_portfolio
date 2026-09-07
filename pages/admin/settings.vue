<script setup lang="ts">
import type { AdminSettings } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Settings',
  robots: 'noindex, nofollow',
})

// ADM-3/ADM-15: site identity — text fields plus asset paths with existence
// checks. Colors are intentionally read-only here (managed on the Theme page in M5).
const toast = useToast()
const { data, error } = await useFetch<{ settings: AdminSettings }>('/api/admin/settings')
const loaded = computed(() => data.value?.settings ?? null)

const form = reactive({
  name: '',
  role: '',
  tagline: '',
  contactEmail: '',
  avatarPath: '',
  faviconPath: '',
  resumePath: '',
})
const baseline = ref('')

function assign(settings: AdminSettings) {
  form.name = settings.name
  form.role = settings.role
  form.tagline = settings.tagline
  form.contactEmail = settings.contactEmail
  form.avatarPath = settings.avatarPath
  form.faviconPath = settings.faviconPath
  form.resumePath = settings.resumePath
  baseline.value = JSON.stringify(form)
}

if (loaded.value) assign(loaded.value)

const dirty = computed(() => JSON.stringify(form) !== baseline.value)
useUnsavedGuard(dirty)

const saving = ref(false)

async function save() {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  saving.value = true
  try {
    const res = await $fetch<{ settings: AdminSettings }>('/api/admin/settings', {
      method: 'PATCH',
      body: { ...form },
    })
    assign(res.settings)
    toast.success('Settings saved')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save settings'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="mt-1 text-sm text-base-content/70">
        Site identity — the name, role and tagline shown across the public site.
      </p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load settings: {{ error.statusMessage ?? error.message }}</span>
    </div>

    <form v-else class="max-w-xl space-y-4" @submit.prevent="save">
      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Name</span></div>
        <input
          v-model="form.name"
          type="text"
          class="input input-bordered input-sm w-full"
          required
        />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Role</span></div>
        <input v-model="form.role" type="text" class="input input-bordered input-sm w-full" />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Tagline</span></div>
        <input v-model="form.tagline" type="text" class="input input-bordered input-sm w-full" />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Contact email</span></div>
        <input
          v-model="form.contactEmail"
          type="email"
          class="input input-bordered input-sm w-full"
        />
      </label>

      <AdminAssetPathInput v-model="form.avatarPath" label="Avatar path" />
      <AdminAssetPathInput v-model="form.faviconPath" label="Favicon path" />
      <AdminAssetPathInput v-model="form.resumePath" label="Resume path" />

      <fieldset class="rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Theme colors</legend>
        <p class="text-xs text-base-content/60">
          Primary and accent colors are managed on the
          <NuxtLink to="/admin/theme" class="link link-primary">Theme page</NuxtLink>.
        </p>
        <div class="mt-3 flex gap-6">
          <div class="flex items-center gap-2">
            <span
              class="inline-block size-6 rounded border border-base-300"
              :style="{ backgroundColor: loaded?.primaryColor }"
              aria-hidden="true"
            />
            <span class="text-sm">
              Primary <code class="text-xs text-base-content/60">{{ loaded?.primaryColor }}</code>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="inline-block size-6 rounded border border-base-300"
              :style="{ backgroundColor: loaded?.accentColor }"
              aria-hidden="true"
            />
            <span class="text-sm">
              Accent <code class="text-xs text-base-content/60">{{ loaded?.accentColor }}</code>
            </span>
          </div>
        </div>
      </fieldset>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save settings
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
