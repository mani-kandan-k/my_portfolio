<script setup lang="ts">
import { ChartColumn, Globe, Inbox, MessageSquare, Settings } from 'lucide-vue-next'
import type { AdminSection } from '~/shared/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Dashboard',
  robots: 'noindex, nofollow',
})

// ADM-2: overview of every section (visible + hidden) with item counts and a
// per-row Manage link into the matching editor page.
const manageRoutes: Record<string, string> = {
  hero: '/admin/hero',
  about: '/admin/about',
  skills: '/admin/skills',
  experience: '/admin/experience',
  projects: '/admin/projects',
  education: '/admin/education',
  contact: '/admin/contact',
  footer: '/admin/contact',
}

const { data, status, error } = await useFetch<{ sections: AdminSection[] }>(
  '/api/admin/sections',
)
const sections = computed(() => data.value?.sections ?? [])
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Admin dashboard</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Every section of the site, its item count and visibility.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/admin/analytics" class="btn btn-outline btn-sm gap-2">
          <ChartColumn class="size-4" aria-hidden="true" />
          Analytics
        </NuxtLink>
        <NuxtLink to="/admin/messages" class="btn btn-outline btn-sm gap-2">
          <Inbox class="size-4" aria-hidden="true" />
          Messages
        </NuxtLink>
        <NuxtLink to="/admin/comments" class="btn btn-outline btn-sm gap-2">
          <MessageSquare class="size-4" aria-hidden="true" />
          Comments
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="btn btn-outline btn-sm gap-2">
          <Settings class="size-4" aria-hidden="true" />
          Settings
        </NuxtLink>
        <NuxtLink to="/admin/seo" class="btn btn-outline btn-sm gap-2">
          <Globe class="size-4" aria-hidden="true" />
          SEO
        </NuxtLink>
      </div>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading sections" />
    </div>

    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load sections: {{ error.statusMessage ?? error.message }}</span>
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-base-300">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Section</th>
            <th>Key</th>
            <th class="text-right">Items</th>
            <th>Visibility</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td>
              <div class="font-medium">{{ section.title }}</div>
              <div v-if="section.subtitle" class="text-xs text-base-content/60">
                {{ section.subtitle }}
              </div>
            </td>
            <td>
              <span class="badge badge-outline badge-sm">{{ section.key }}</span>
            </td>
            <td class="text-right tabular-nums">{{ section.itemCount }}</td>
            <td>
              <span class="badge badge-sm" :class="section.visible ? 'badge-success' : 'badge-ghost'">
                {{ section.visible ? 'Visible' : 'Hidden' }}
              </span>
            </td>
            <td class="text-right">
              <NuxtLink :to="manageRoutes[section.key] ?? '/admin/sections'" class="btn btn-ghost btn-xs">
                Manage
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
