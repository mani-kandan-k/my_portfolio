<script setup lang="ts">
import type { AdminSection } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Sections',
  robots: 'noindex, nofollow',
})

// ADM-4: every section (visible + hidden) — drag to reorder, edit titles and
// subtitles on blur, toggle visibility. All saves are immediate, so no
// page-level unsaved guard is needed.
const toast = useToast()
const { data, status, error, refresh } = await useFetch<{ sections: AdminSection[] }>(
  '/api/admin/sections',
)

const list = ref<AdminSection[]>([])
const savedFields = ref<Record<number, { title: string; subtitle: string }>>({})

watch(
  data,
  (d) => {
    if (!d) return
    list.value = d.sections.map((section) => ({ ...section }))
    savedFields.value = Object.fromEntries(
      d.sections.map((section) => [
        section.id,
        { title: section.title, subtitle: section.subtitle },
      ]),
    )
  },
  { immediate: true },
)

async function saveTitleSubtitle(section: AdminSection) {
  const saved = savedFields.value[section.id]
  if (!saved) return
  const title = section.title.trim()
  const subtitle = section.subtitle.trim()
  if (title === '') {
    section.title = saved.title
    toast.error('Title cannot be empty')
    return
  }
  if (title === saved.title && subtitle === saved.subtitle) return
  try {
    await $fetch(`/api/admin/sections/${section.id}`, {
      method: 'PATCH',
      body: { title, subtitle },
    })
    savedFields.value[section.id] = { title, subtitle }
    toast.success(`Saved “${title}”`)
  } catch (err) {
    section.title = saved.title
    section.subtitle = saved.subtitle
    toast.error(apiErrorMessage(err, 'Failed to save section'))
  }
}

async function toggleVisible(section: AdminSection) {
  // v-model has already applied the new value; revert it on failure.
  try {
    await $fetch(`/api/admin/sections/${section.id}`, {
      method: 'PATCH',
      body: { visible: section.visible },
    })
    toast.success(section.visible ? `“${section.title}” is visible` : `“${section.title}” is hidden`)
  } catch (err) {
    section.visible = !section.visible
    toast.error(apiErrorMessage(err, 'Failed to update visibility'))
  }
}

async function onReorder(ids: number[]) {
  const byId = new Map(list.value.map((section) => [section.id, section]))
  list.value = ids.flatMap((id) => {
    const section = byId.get(id)
    return section ? [section] : []
  })
  try {
    await $fetch('/api/admin/sections/reorder', { method: 'POST', body: { ids } })
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to reorder sections'))
    await refresh()
  }
}

function blurOnEnter(event: KeyboardEvent) {
  ;(event.target as HTMLInputElement).blur()
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Sections</h1>
      <p class="mt-1 text-sm text-base-content/70">
        Drag to reorder the site sections. Titles and subtitles save on blur; the toggle flips
        visibility immediately.
      </p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading sections" />
    </div>

    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load sections: {{ error.statusMessage ?? error.message }}</span>
    </div>

    <AdminSortableList v-else :items="list" @reordered="onReorder">
      <template #default="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="badge badge-outline badge-sm shrink-0">{{ item.key }}</span>
          <input
            v-model="item.title"
            type="text"
            class="input input-bordered input-xs w-36"
            aria-label="Section title"
            @blur="saveTitleSubtitle(item)"
            @keydown.enter="blurOnEnter"
          />
          <input
            v-model="item.subtitle"
            type="text"
            class="input input-bordered input-xs w-40 min-w-0 flex-1"
            placeholder="Subtitle"
            aria-label="Section subtitle"
            @blur="saveTitleSubtitle(item)"
            @keydown.enter="blurOnEnter"
          />
          <span class="shrink-0 text-xs tabular-nums text-base-content/50">
            {{ item.itemCount }} items
          </span>
          <input
            v-model="item.visible"
            type="checkbox"
            class="toggle toggle-primary toggle-sm shrink-0"
            :aria-label="`Toggle ${item.title} visibility`"
            @change="toggleVisible(item)"
          />
        </div>
      </template>
    </AdminSortableList>
  </section>
</template>
