<script setup lang="ts">
import { BarElement, BarController, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { AnalyticsDayViews } from '~/shared/types/analytics'

// ADM-20: views-over-time bar chart. Only the pieces we use are registered —
// keeps chart.js tree-shaken. Bars use daisyUI theme vars (oklch triplets
// injected at runtime by the theme system, so they follow admin color picks).
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  days: AnalyticsDayViews[]
}>()

const chartData = computed(() => ({
  labels: props.days.map((day) => day.date.slice(5)), // "MM-DD" keeps the axis compact
  datasets: [
    {
      label: 'Views',
      data: props.days.map((day) => day.views),
      backgroundColor: 'oklch(var(--p) / 0.7)',
      hoverBackgroundColor: 'oklch(var(--p))',
      borderColor: 'oklch(var(--p))',
      borderWidth: 1,
      borderRadius: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { maxTicksLimit: 12, autoSkip: true } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
} as const
</script>

<template>
  <div class="h-64 w-full">
    <Bar :data="chartData" :options="chartOptions" aria-label="Views over time" />
  </div>
</template>
