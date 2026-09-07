<script setup lang="ts">
import type { AnalyticsSummary } from '~/shared/types/analytics'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Analytics',
  robots: 'noindex, nofollow',
})

// ANA-3 / ADM-20: cookieless pageview stats over a selectable window.
const RANGES = [7, 30, 90] as const
const range = ref<(typeof RANGES)[number]>(30)

const { data, status, error, refresh } = await useFetch<AnalyticsSummary>('/api/admin/analytics', {
  query: { range },
})

const stats = computed(() => data.value)
const viewsPerDay = computed(() => {
  if (!stats.value || stats.value.range === 0) return '0'
  return (stats.value.totalViews / stats.value.range).toFixed(1)
})

const empty = computed(
  () => status.value === 'success' && stats.value?.totalViews === 0,
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Analytics</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Cookieless pageview stats — no PII, visitors are daily-rotating HMAC hashes.
        </p>
      </div>
      <div class="join" role="group" aria-label="Date range">
        <button
          v-for="option in RANGES"
          :key="option"
          type="button"
          class="btn join-item btn-sm"
          :class="{ 'btn-active': range === option }"
          @click="range = option"
        >
          {{ option }}d
        </button>
      </div>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading analytics" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load analytics: {{ error.statusMessage ?? error.message }}</span>
      <button type="button" class="btn btn-ghost btn-xs" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="stats">
      <div class="stats stats-vertical w-full shadow sm:stats-horizontal">
        <div class="stat py-4">
          <div class="stat-title">Total views</div>
          <div class="stat-value text-primary">{{ stats.totalViews.toLocaleString() }}</div>
          <div class="stat-desc">last {{ stats.range }} days</div>
        </div>
        <div class="stat py-4">
          <div class="stat-title">Unique visitors</div>
          <div class="stat-value text-primary">{{ stats.uniqueVisitors.toLocaleString() }}</div>
          <div class="stat-desc">distinct daily hashes</div>
        </div>
        <div class="stat py-4">
          <div class="stat-title">Views / day</div>
          <div class="stat-value text-primary">{{ viewsPerDay }}</div>
          <div class="stat-desc">average over the range</div>
        </div>
      </div>

      <p v-if="empty" class="text-sm text-base-content/60">
        No pageviews recorded in this range yet — they appear as public pages get visits.
      </p>

      <div class="rounded-box border border-base-300 p-4">
        <h2 class="mb-3 text-sm font-semibold">Views over time</h2>
        <ClientOnly>
          <AdminViewsChart :days="stats.viewsOverTime" />
          <template #fallback>
            <div class="flex h-64 items-center justify-center">
              <span class="loading loading-spinner loading-md" aria-label="Loading chart" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-box border border-base-300">
          <h2 class="border-b border-base-300 px-4 py-2.5 text-sm font-semibold">Top pages</h2>
          <table class="table table-sm">
            <tbody>
              <tr v-for="page in stats.topPages" :key="page.path">
                <td class="max-w-0 truncate font-mono text-xs">{{ page.path }}</td>
                <td class="w-16 text-right tabular-nums">{{ page.views }}</td>
              </tr>
              <tr v-if="stats.topPages.length === 0">
                <td class="text-sm text-base-content/50">No data yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-box border border-base-300">
          <h2 class="border-b border-base-300 px-4 py-2.5 text-sm font-semibold">Top referrers</h2>
          <table class="table table-sm">
            <tbody>
              <tr v-for="ref in stats.topReferrers" :key="ref.referrer">
                <td class="max-w-0 truncate">{{ ref.referrer }}</td>
                <td class="w-16 text-right tabular-nums">{{ ref.views }}</td>
              </tr>
              <tr v-if="stats.topReferrers.length === 0">
                <td class="text-sm text-base-content/50">No data yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-box border border-base-300">
          <h2 class="border-b border-base-300 px-4 py-2.5 text-sm font-semibold">Devices</h2>
          <table class="table table-sm">
            <tbody>
              <tr v-for="row in stats.devices" :key="row.device">
                <td class="capitalize">{{ row.device }}</td>
                <td class="w-16 text-right tabular-nums">{{ row.views }}</td>
              </tr>
              <tr v-if="stats.devices.length === 0">
                <td class="text-sm text-base-content/50">No data yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-box border border-base-300">
          <h2 class="border-b border-base-300 px-4 py-2.5 text-sm font-semibold">Browsers</h2>
          <table class="table table-sm">
            <tbody>
              <tr v-for="row in stats.browsers" :key="row.browser">
                <td>{{ row.browser }}</td>
                <td class="w-16 text-right tabular-nums">{{ row.views }}</td>
              </tr>
              <tr v-if="stats.browsers.length === 0">
                <td class="text-sm text-base-content/50">No data yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>
