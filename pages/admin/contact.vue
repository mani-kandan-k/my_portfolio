<script setup lang="ts">
import type { AdminSection } from '~/shared/types/admin'
import type { ContactPayload, FooterPayload } from '~/shared/types/site'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Contact & Footer',
  robots: 'noindex, nofollow',
})

// Contact blurb and footer text are payloads of two separate sections; one Save
// patches both.
const toast = useToast()
const { data, error } = await useFetch<{ sections: AdminSection[] }>('/api/admin/sections')
const contactSection = computed(() => data.value?.sections.find((s) => s.key === 'contact') ?? null)
const footerSection = computed(() => data.value?.sections.find((s) => s.key === 'footer') ?? null)

const form = reactive({ blurb: '', footerText: '' })
const baseline = ref('')

function assign() {
  form.blurb = (contactSection.value?.payload as ContactPayload | undefined)?.blurb ?? ''
  form.footerText = (footerSection.value?.payload as FooterPayload | undefined)?.text ?? ''
  baseline.value = JSON.stringify(form)
}

if (contactSection.value || footerSection.value) assign()

const dirty = computed(() => JSON.stringify(form) !== baseline.value)
useUnsavedGuard(dirty)

const saving = ref(false)

async function save() {
  const contact = contactSection.value
  const footer = footerSection.value
  if (!contact || !footer) return
  saving.value = true
  try {
    await Promise.all([
      $fetch(`/api/admin/sections/${contact.id}`, {
        method: 'PATCH',
        body: { payload: { ...contact.payload, blurb: form.blurb } },
      }),
      $fetch(`/api/admin/sections/${footer.id}`, {
        method: 'PATCH',
        body: { payload: { ...footer.payload, text: form.footerText } },
      }),
    ])
    baseline.value = JSON.stringify(form)
    toast.success('Contact & footer saved')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Contact &amp; Footer</h1>
      <p class="mt-1 text-sm text-base-content/70">
        The contact section blurb and the footer line. Social links are managed on the
        <NuxtLink to="/admin/links" class="link link-primary">Links</NuxtLink> page.
      </p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load sections: {{ error.statusMessage ?? error.message }}</span>
    </div>
    <div v-else-if="!contactSection || !footerSection" class="alert alert-warning">
      <span>Sections “contact” and/or “footer” are missing — reseed the database.</span>
    </div>

    <form v-else class="max-w-xl space-y-4" @submit.prevent="save">
      <fieldset class="rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Contact blurb</legend>
        <textarea
          v-model="form.blurb"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="Have a question or an opportunity? Send a message below."
          aria-label="Contact blurb"
        />
      </fieldset>

      <fieldset class="rounded-lg border border-base-300 p-4">
        <legend class="px-1 text-sm font-medium">Footer text</legend>
        <input
          v-model="form.footerText"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Leave empty for the default copyright line"
          aria-label="Footer text"
        />
      </fieldset>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save contact &amp; footer
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
