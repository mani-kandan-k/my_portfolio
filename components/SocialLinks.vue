<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import { Github, Globe, Linkedin, Mail, Twitter } from 'lucide-vue-next'
import type { SocialLinkItem } from '~/shared/types/site'

withDefaults(
  defineProps<{
    links: SocialLinkItem[]
    variant?: 'buttons' | 'icons'
  }>(),
  { variant: 'buttons' },
)

const iconMap: Record<string, FunctionalComponent> = {
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
  twitter: Twitter,
  mail: Mail,
  email: Mail,
}

function iconFor(link: SocialLinkItem): FunctionalComponent {
  return iconMap[link.icon.toLowerCase()] ?? Globe
}

function isExternal(link: SocialLinkItem): boolean {
  return /^https?:\/\//.test(link.url)
}
</script>

<template>
  <ul
    v-if="links.length"
    class="flex flex-wrap items-center"
    :class="variant === 'icons' ? 'gap-2' : 'gap-3'"
  >
    <li v-for="link in links" :key="link.id">
      <a
        v-if="variant === 'buttons'"
        :href="link.url"
        :target="isExternal(link) ? '_blank' : undefined"
        :rel="isExternal(link) ? 'noopener noreferrer' : undefined"
        class="btn btn-outline btn-sm gap-2"
      >
        <component :is="iconFor(link)" class="size-4" aria-hidden="true" />
        {{ link.label }}
      </a>
      <a
        v-else
        :href="link.url"
        :target="isExternal(link) ? '_blank' : undefined"
        :rel="isExternal(link) ? 'noopener noreferrer' : undefined"
        class="btn btn-ghost btn-sm btn-circle"
        :aria-label="link.label"
        :title="link.label"
      >
        <component :is="iconFor(link)" class="size-5" aria-hidden="true" />
      </a>
    </li>
  </ul>
</template>
