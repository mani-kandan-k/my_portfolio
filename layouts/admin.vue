<script setup lang="ts">
import {
  ArrowLeft,
  Briefcase,
  ChartColumn,
  FolderKanban,
  Globe,
  GraduationCap,
  Inbox,
  Layers,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-vue-next'

const { user } = useUserSession()
const route = useRoute()

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/sections', label: 'Sections', icon: Layers },
  { to: '/admin/hero', label: 'Hero', icon: Sparkles },
  { to: '/admin/about', label: 'About', icon: UserRound },
  { to: '/admin/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/links', label: 'Links', icon: Link2 },
  { to: '/admin/contact', label: 'Contact & Footer', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/theme', label: 'Theme', icon: Palette },
  { to: '/admin/seo', label: 'SEO', icon: Globe },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
]

// /admin matches exactly; sub-pages use a prefix so only one item is active.
const isActive = (to: string) =>
  to === '/admin' ? route.path === '/admin' : route.path.startsWith(to)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-base-100 text-base-content">
    <header class="border-b border-base-300 bg-base-100/80 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <NuxtLink to="/admin" class="text-lg font-bold tracking-tight">
          Admin<span class="text-base-content/50"> · {{ user?.username }}</span>
        </NuxtLink>
        <a href="/api/auth/logout" rel="nofollow" class="btn btn-ghost btn-sm gap-2">
          <LogOut class="size-4" aria-hidden="true" />
          Sign out
        </a>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
      <aside class="w-full shrink-0 lg:w-44">
        <ul
          class="menu menu-sm flex-row flex-wrap rounded-box border border-base-300 bg-base-200/50 lg:flex-col lg:flex-nowrap"
        >
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink :to="item.to" class="gap-2" :class="{ active: isActive(item.to) }">
              <component :is="item.icon" class="size-4" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/" class="gap-2">
              <ArrowLeft class="size-4" aria-hidden="true" />
              Back to site
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>

    <AppToasts />
  </div>
</template>
