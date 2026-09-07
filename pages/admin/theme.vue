<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { AdminSettings } from '~/shared/types/admin'
import {
  THEME_BASE_BG,
  buildBrandCss,
  contrastRatio,
  darkVariantHex,
  hexToDaisyVar,
  isValidHex,
  normalizeHex,
} from '~/shared/colors'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Theme',
  robots: 'noindex, nofollow',
})

// ADM-12: pick Primary/Accent with a picker + hex input, preview both modes live,
// save applies site-wide without reload (SSR style tag is patched client-side, M5.3).
const toast = useToast()
const { data, error } = await useFetch<{ settings: AdminSettings }>('/api/admin/settings')

const form = reactive({ primaryColor: '', accentColor: '' })
const baseline = ref('')

function assign(settings: AdminSettings) {
  form.primaryColor = settings.primaryColor
  form.accentColor = settings.accentColor
  baseline.value = JSON.stringify(form)
}

if (data.value?.settings) assign(data.value.settings)

const dirty = computed(() => JSON.stringify(form) !== baseline.value)
useUnsavedGuard(dirty)

const primaryValid = computed(() => isValidHex(form.primaryColor))
const accentValid = computed(() => isValidHex(form.accentColor))
const valid = computed(() => primaryValid.value && accentValid.value)

// Live preview: apply the edited colors as daisyUI CSS-var overrides scoped to
// each preview pane (dark mode gets the same lightness-lifted variant as prod).
const lightVars = computed(() =>
  primaryValid.value && accentValid.value
    ? { '--p': hexToDaisyVar(form.primaryColor), '--a': hexToDaisyVar(form.accentColor) }
    : {},
)
const darkVars = computed(() =>
  primaryValid.value && accentValid.value
    ? {
        '--p': hexToDaisyVar(darkVariantHex(form.primaryColor)),
        '--a': hexToDaisyVar(darkVariantHex(form.accentColor)),
      }
    : {},
)

// Contrast guard (PRD §7.3): brand color vs base background per mode; AA text
// needs ≥ 4.5:1. Warn only — the admin may target decorative use.
const contrastWarnings = computed(() => {
  if (!valid.value) return []
  const checks: [string, string, string][] = [
    ['Primary', normalizeHex(form.primaryColor), THEME_BASE_BG.light],
    ['Primary', darkVariantHex(form.primaryColor), THEME_BASE_BG.dark],
    ['Accent', normalizeHex(form.accentColor), THEME_BASE_BG.light],
    ['Accent', darkVariantHex(form.accentColor), THEME_BASE_BG.dark],
  ]
  const mode = (bg: string) => (bg === THEME_BASE_BG.light ? 'light' : 'dark')
  return checks
    .map(([label, fg, bg]) => ({ label, fg, bg, ratio: contrastRatio(fg, bg), mode: mode(bg) }))
    .filter((c) => c.ratio < 4.5)
})

const saving = ref(false)

async function save() {
  if (!valid.value || saving.value) return
  saving.value = true
  try {
    const res = await $fetch<{ primaryColor: string; accentColor: string }>('/api/admin/theme', {
      method: 'PATCH',
      body: { primaryColor: form.primaryColor, accentColor: form.accentColor },
    })
    // M5.3: patch the SSR-injected style tag so the running page (public + admin)
    // re-themes instantly; fresh loads get the new values from the server.
    const tag = document.getElementById('brand-colors')
    if (tag) tag.textContent = buildBrandCss(res.primaryColor, res.accentColor)
    form.primaryColor = res.primaryColor
    form.accentColor = res.accentColor
    baseline.value = JSON.stringify(form)
    toast.success('Theme updated')
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to save theme'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Theme</h1>
      <p class="mt-1 text-sm text-base-content/70">
        Primary and accent colors apply site-wide in both light and dark mode. Dark mode uses a
        lightness-lifted variant of each color automatically.
      </p>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Failed to load theme: {{ error.statusMessage ?? error.message }}</span>
    </div>

    <form v-else class="space-y-6" @submit.prevent="save">
      <div class="grid max-w-2xl gap-4 sm:grid-cols-2">
        <fieldset
          v-for="field in [
            { key: 'primaryColor', label: 'Primary', valid: primaryValid },
            { key: 'accentColor', label: 'Accent', valid: accentValid },
          ]"
          :key="field.key"
          class="rounded-lg border border-base-300 p-4"
        >
          <legend class="px-1 text-sm font-medium">{{ field.label }}</legend>
          <div class="flex items-center gap-3">
            <input
              :value="field.valid ? normalizeHex(form[field.key as 'primaryColor' | 'accentColor']) : '#000000'"
              type="color"
              class="h-10 w-14 cursor-pointer rounded border border-base-300 bg-base-100 p-1"
              :aria-label="`${field.label} color picker`"
              @input="form[field.key as 'primaryColor' | 'accentColor'] = ($event.target as HTMLInputElement).value"
            />
            <input
              v-model="form[field.key as 'primaryColor' | 'accentColor']"
              type="text"
              class="input input-bordered input-sm w-28 font-mono"
              :class="{ 'input-error': !field.valid }"
              placeholder="#4f46e5"
              spellcheck="false"
            />
          </div>
          <p v-if="!field.valid" class="mt-2 text-xs text-error">
            Must be a hex color like #4f46e5
          </p>
        </fieldset>
      </div>

      <div
        v-if="contrastWarnings.length"
        class="alert alert-warning max-w-2xl"
        role="status"
      >
        <AlertTriangle class="size-5 shrink-0" aria-hidden="true" />
        <div>
          <p class="font-medium">Low contrast warning</p>
          <ul class="mt-1 list-inside list-disc text-sm">
            <li v-for="w in contrastWarnings" :key="w.label + w.mode">
              {{ w.label }} in {{ w.mode }} mode: {{ w.ratio.toFixed(2) }}:1 against the background
              (WCAG AA wants ≥ 4.5:1)
            </li>
          </ul>
          <p class="mt-1 text-xs opacity-80">You can still save — this is a heads-up, not a block.</p>
        </div>
      </div>

      <fieldset class="space-y-3">
        <legend class="text-sm font-medium">Preview</legend>
        <div class="grid gap-4 lg:grid-cols-2">
          <div
            v-for="pane in [
              { label: 'Light', theme: 'portfolio', vars: lightVars },
              { label: 'Dark', theme: 'portfolio-dark', vars: darkVars },
            ]"
            :key="pane.theme"
            :data-theme="pane.theme"
            :style="pane.vars"
            class="rounded-xl border border-base-300 bg-base-100 p-4 text-base-content"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-base-content/50">
              {{ pane.label }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" class="btn btn-primary btn-sm">Primary</button>
              <button type="button" class="btn btn-accent btn-sm">Accent</button>
              <button type="button" class="btn btn-outline btn-primary btn-sm">Outline</button>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="badge badge-primary">Primary badge</span>
              <span class="badge badge-accent">Accent badge</span>
              <a href="#" class="link link-primary text-sm" @click.prevent>Primary link</a>
            </div>
            <div class="card mt-3 border border-base-300 bg-base-200">
              <div class="card-body p-4">
                <p class="text-sm font-semibold">Card title</p>
                <p class="text-sm text-base-content/70">
                  Body text on a card, with a <span class="font-medium text-primary">primary</span>
                  and <span class="font-medium text-accent">accent</span> highlight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="flex items-center gap-3">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving || !dirty || !valid">
          <span v-if="saving" class="loading loading-spinner loading-xs" aria-hidden="true" />
          Save theme
        </button>
        <span v-if="dirty" class="text-xs text-warning">Unsaved changes</span>
      </div>
    </form>
  </section>
</template>
