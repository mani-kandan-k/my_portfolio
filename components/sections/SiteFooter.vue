<script setup lang="ts">
import type {
  FooterPayload,
  PublicSection,
  SiteSettingsPublic,
  SocialLinkItem,
} from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const payload = computed(() => props.section.payload as FooterPayload)
const socialLinks = computed(() => props.section.items as SocialLinkItem[])
const year = new Date().getFullYear()
</script>

<template>
  <footer id="footer" class="border-t border-base-300 bg-base-200/40">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <div class="text-sm text-base-content/60">
        <p>© {{ year }} {{ settings?.name }}</p>
        <p v-if="payload.text" class="mt-1">{{ payload.text }}</p>
        <!-- ANA-2: privacy note for the built-in cookieless analytics (8.5) -->
        <p class="mt-2 text-xs text-base-content/45">
          Privacy-friendly analytics: cookieless, anonymized with daily-rotating hashes, no
          personal data stored. DNT is respected.
        </p>
      </div>
      <SocialLinks :links="socialLinks" variant="icons" />
    </div>
  </footer>
</template>
