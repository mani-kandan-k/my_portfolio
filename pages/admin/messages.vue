<script setup lang="ts">
import { Mail, MailOpen } from 'lucide-vue-next'
import type { AdminMessageItem } from '~/shared/types/engagement'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Messages',
  robots: 'noindex, nofollow',
})

// ADM-21: contact-form inbox — newest first, read/unread toggle, hard delete,
// per-message Resend delivery status.
const toast = useToast()

const { data, status, error, refresh } = await useFetch<{ messages: AdminMessageItem[] }>(
  '/api/admin/messages',
)
const messages = computed(() => data.value?.messages ?? [])

// Click a message to expand the full text (they're clamped to 2 lines).
const expanded = ref<Set<number>>(new Set())
function toggleExpanded(id: number) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function isExpanded(id: number) {
  return expanded.value.has(id)
}

async function setRead(message: AdminMessageItem, read: boolean) {
  try {
    const res = await $fetch<{ message: AdminMessageItem }>(`/api/admin/messages/${message.id}`, {
      method: 'PATCH',
      body: { read },
    })
    const row = data.value?.messages.find((m) => m.id === message.id)
    if (row) row.readAt = res.message.readAt
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to update message'))
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    toast.success('Message deleted')
    if (data.value) data.value.messages = data.value.messages.filter((m) => m.id !== id)
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete message'))
  }
}
</script>

<template>
  <section class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold">Messages</h1>
      <p class="mt-1 text-sm text-base-content/70">
        Contact-form inbox — every message is stored here whether or not email delivery succeeded.
      </p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading messages" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load messages: {{ error.statusMessage ?? error.message }}</span>
      <button type="button" class="btn btn-ghost btn-xs" @click="refresh()">Retry</button>
    </div>
    <p v-else-if="messages.length === 0" class="text-sm text-base-content/60">
      No messages yet — contact-form submissions land here.
    </p>

    <div v-else class="overflow-x-auto rounded-box border border-base-300">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>From</th>
            <th>Message</th>
            <th>Received</th>
            <th>Delivery</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="message in messages" :key="message.id">
            <td>
              <div :class="{ 'font-semibold': !message.readAt }">
                {{ message.name }}
                <span v-if="!message.readAt" class="badge badge-primary badge-xs ml-1">new</span>
              </div>
              <a :href="`mailto:${message.email}`" class="link-hover link text-xs text-base-content/60">
                {{ message.email }}
              </a>
            </td>
            <td class="max-w-md">
              <button
                type="button"
                class="block w-full cursor-pointer text-left whitespace-pre-line"
                :class="{ 'line-clamp-2': !isExpanded(message.id), 'font-semibold': !message.readAt }"
                :aria-expanded="isExpanded(message.id)"
                @click="toggleExpanded(message.id)"
              >
                {{ message.message }}
              </button>
            </td>
            <td class="whitespace-nowrap">
              <time
                :datetime="message.createdAt"
                :title="new Date(message.createdAt).toLocaleString()"
              >
                {{ relativeTime(message.createdAt) }}
              </time>
            </td>
            <td>
              <span
                class="badge badge-sm"
                :class="message.emailDelivered ? 'badge-success' : 'badge-ghost'"
              >
                {{ message.emailDelivered ? 'emailed' : 'stored only' }}
              </span>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs gap-1"
                  @click="setRead(message, !message.readAt)"
                >
                  <MailOpen v-if="!message.readAt" class="size-3.5" aria-hidden="true" />
                  <Mail v-else class="size-3.5" aria-hidden="true" />
                  {{ message.readAt ? 'Mark unread' : 'Mark read' }}
                </button>
                <AdminDeleteButton @confirm="remove(message.id)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
