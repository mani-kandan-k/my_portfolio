<script setup lang="ts">
import { CircleCheck, Send } from 'lucide-vue-next'
import { contactMessageSchema } from '~/shared/schemas/engagement'
import type {
  ContactPayload,
  PublicSection,
  SiteSettingsPublic,
  SocialLinkItem,
} from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const payload = computed(() => props.section.payload as ContactPayload)
const socialLinks = computed(() => props.section.items as SocialLinkItem[])
const hasContent = computed(() => Boolean(payload.value.blurb || socialLinks.value.length))

// PUB-8/9: contact form. Client-side validation reuses the server's zod
// schema so inline errors match what the API enforces; the hidden `website`
// field is the honeypot — bots fill it, humans never see it.
const toast = useToast()
const form = reactive({ name: '', email: '', message: '', website: '' })
const errors = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const sent = ref(false)

const FIELD_LABELS = { name: 'Name', email: 'Email', message: 'Message' } as const

function validate(): boolean {
  const parsed = contactMessageSchema.safeParse(form)
  errors.name = ''
  errors.email = ''
  errors.message = ''
  if (parsed.success) return true
  for (const issue of parsed.error.issues) {
    const field = issue.path[0]
    if (field !== 'name' && field !== 'email' && field !== 'message') continue
    if (errors[field]) continue // first issue per field wins
    if (issue.code === 'invalid_format') {
      errors[field] = 'Enter a valid email address'
    } else if (issue.code === 'too_small') {
      errors[field] = `${FIELD_LABELS[field]} is required`
    } else if (issue.code === 'too_big') {
      errors[field] = `${FIELD_LABELS[field]} is too long`
    } else {
      errors[field] = issue.message
    }
  }
  return false
}

async function submit() {
  if (sending.value || !validate()) return
  sending.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form } })
    sent.value = true
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to send — please try again'))
  } finally {
    sending.value = false
  }
}

function writeAnother() {
  form.name = ''
  form.email = ''
  form.message = ''
  form.website = ''
  sent.value = false
}
</script>

<template>
  <section v-if="hasContent" id="contact">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <div class="grid gap-10 lg:grid-cols-2">
        <div>
          <p v-if="payload.blurb" class="max-w-xl text-base-content/80">{{ payload.blurb }}</p>
          <SocialLinks :links="socialLinks" variant="buttons" class="mt-8" />
        </div>

        <div v-if="sent" class="flex flex-col items-start gap-4 rounded-box border border-success/40 bg-success/10 p-6">
          <span class="flex items-center gap-2 text-lg font-semibold text-success">
            <CircleCheck class="size-6" aria-hidden="true" />
            Message sent!
          </span>
          <p class="text-sm text-base-content/70">
            Thanks for reaching out — I'll get back to you soon.
          </p>
          <button type="button" class="btn btn-outline btn-sm" @click="writeAnother">
            Write another message
          </button>
        </div>

        <form v-else class="space-y-4" novalidate @submit.prevent="submit">
          <!-- Honeypot: invisible to humans, irresistible to bots (PUB-9) -->
          <div class="hidden" aria-hidden="true">
            <label for="contact-website">Website</label>
            <input
              id="contact-website"
              v-model="form.website"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <div class="form-control w-full">
            <label class="label py-1" for="contact-name"><span class="label-text">Name</span></label>
            <input
              id="contact-name"
              v-model="form.name"
              type="text"
              name="name"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.name }"
              :aria-invalid="Boolean(errors.name)"
              aria-describedby="contact-name-error"
              autocomplete="name"
              maxlength="100"
            />
            <p v-if="errors.name" id="contact-name-error" class="mt-1 text-xs text-error">
              {{ errors.name }}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label py-1" for="contact-email"><span class="label-text">Email</span></label>
            <input
              id="contact-email"
              v-model="form.email"
              type="email"
              name="email"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.email }"
              :aria-invalid="Boolean(errors.email)"
              aria-describedby="contact-email-error"
              autocomplete="email"
              maxlength="200"
            />
            <p v-if="errors.email" id="contact-email-error" class="mt-1 text-xs text-error">
              {{ errors.email }}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label py-1" for="contact-message">
              <span class="label-text">Message</span>
            </label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="5"
              class="textarea textarea-bordered w-full"
              :class="{ 'textarea-error': errors.message }"
              :aria-invalid="Boolean(errors.message)"
              aria-describedby="contact-message-error"
              maxlength="5000"
            />
            <p v-if="errors.message" id="contact-message-error" class="mt-1 text-xs text-error">
              {{ errors.message }}
            </p>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="sending">
            <span v-if="sending" class="loading loading-spinner loading-xs" aria-hidden="true" />
            <Send v-else class="size-4" aria-hidden="true" />
            {{ sending ? 'Sending…' : 'Send message' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
