<script setup lang="ts">
import type { AdminSection } from '~/shared/types/admin'
import type { HeroPayload } from '~/shared/types/site'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Hero',
  robots: 'noindex, nofollow',
})

// ADM-5: the hero section's payload — greeting, sub-headline and the two CTAs.
// The big headline itself is the site name, edited on the Settings page.
const toast = useToast()
const { data, error } = await useFetch<{ sections: AdminSection[] }>('/api/admin/sections')
const hero = computed(() => data.value?.sections.find((s) => s.key === 'hero') ?? null)

const form = reactive({
  greeting: '',
  subHeadline: '',
  primaryCta: { label: '', url: '' },
  secondaryCta: { label: '', url: '' },
  images: ['', '', ''],
})
const baseline = ref('')

function assign(section: AdminSection) {
  const payload = section.payload as HeroPayload
  form.greeting = payload.greeting ?? ''
  form.subHeadline = payload.subHeadline ?? ''
  form.primaryCta = {
    label: payload.primaryCta?.label ?? '',
    url: payload.primaryCta?.url ?? '',
  }
  form.secondaryCta = {
    label: payload.secondaryCta?.label ?? '',
    url: payload.secondaryCta?.url ?? '',
  }
  const images = payload.images ?? []
  form.images = [images[0] ?? '', images[1] ?? '', images[2] ?? '']
  baseline.value = JSON.stringify(form)
}

if (hero.value) assign(hero.value)

const dirty = computed(() => JSON.stringify(form) !== baseline.value)
useUnsavedGuard(dirty)

const saving = ref(false)

async function save() {
  const section = hero.value
  if (!section) return
  saving.value = true
  try {
    // Merge: keep any unknown payload keys, overwrite the managed ones.
    const payload = {
      ...section.payload,
      greeting: form.greeting.trim(),
      subHeadline: form.subHeadline.trim(),
      primaryCta: { label: form.primaryCta.label.trim(), url: form.primaryCta.url.trim() },
      secondaryCta: { label: form.secondaryCta.label.trim(), url: form.secondaryCta.url.trim() },
      images: form.images.map((image) => image.trim()).filter(Boolean),
    }
    await $fetch(`/api/admin/sections/${section.id}`, { method: 'PATCH', body: { payload } })
    baseline.value = JSON.stringify(form)
    toast.success('Hero saved')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save hero'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Hero</h1>
      <p class="mt-1 text-sm text-base-content/70">The intro block at the top of the site.</p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load sections: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <div v-else-if="!hero" class="alert alert-warning">
      <span>No section with key “hero” exists — reseed the database.</span>
    </div>

    <form v-else class="max-w-xl space-y-4" @submit.prevent="save">
      <div class="alert text-sm">
        <span>
          The headline between the greeting and the sub-headline is the site name, managed on the
          <NuxtLink to="/admin/settings" class="link link-primary">Settings</NuxtLink> page.
        </span>
      </div>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Greeting</span></div>
        <input
          v-model="form.greeting"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Hi, I'm"
        />
      </label>

      <label class="form-control w-full">
        <div class="label py-1"><span class="label-text">Sub-headline</span></div>
        <input
          v-model="form.subHeadline"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="I build web products end to end."
        />
      </label>

      <fieldset class="space-y-3 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Primary call to action</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="form-control w-full">
            <div class="label py-1"><span class="label-text">Label</span></div>
            <input
              v-model="form.primaryCta.label"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="View projects"
            />
          </label>
          <label class="form-control w-full">
            <div class="label py-1"><span class="label-text">URL</span></div>
            <input
              v-model="form.primaryCta.url"
              type="text"
              class="input input-bordered input-sm w-full font-mono"
              placeholder="#projects"
            />
          </label>
        </div>
      </fieldset>

      <fieldset class="space-y-3 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Secondary call to action</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="form-control w-full">
            <div class="label py-1"><span class="label-text">Label</span></div>
            <input
              v-model="form.secondaryCta.label"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="Get in touch"
            />
          </label>
          <label class="form-control w-full">
            <div class="label py-1"><span class="label-text">URL</span></div>
            <input
              v-model="form.secondaryCta.url"
              type="text"
              class="input input-bordered input-sm w-full font-mono"
              placeholder="#contact"
            />
          </label>
        </div>
      </fieldset>

      <fieldset class="space-y-3 rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Hero images (up to 3)</legend>
        <p class="text-xs text-base-content/60">
          Portrait-orientation photos shown as a strip below the buttons. Use the Upload button or
          a path under /assets/.
        </p>
        <AdminAssetPathInput v-model="form.images[0]" label="Image 1" />
        <AdminAssetPathInput v-model="form.images[1]" label="Image 2" />
        <AdminAssetPathInput v-model="form.images[2]" label="Image 3" />
      </fieldset>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save hero
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
