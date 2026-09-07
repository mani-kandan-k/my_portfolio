<script setup lang="ts">
import { ChevronDown, Github, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from 'lucide-vue-next'

const { settings, sections } = useSite()
const { theme, toggle } = useTheme()
const { loggedIn, user } = useUserSession()
const menuOpen = ref(false)
const route = useRoute()

// Anchor links for visible content sections only; hero/footer don't get nav entries.
const navLinks = computed(() =>
  sections.value
    .filter((s) => !['hero', 'footer'].includes(s.key))
    .map((s) => ({ key: s.key, title: s.title, to: `/#${s.key}` })),
)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-base-300 bg-base-100/80 backdrop-blur">
    <nav
      class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      aria-label="Main navigation"
    >
      <NuxtLink
        to="/"
        class="flex min-w-0 items-center gap-2.5 text-lg font-bold tracking-tight text-base-content"
      >
        <img
          v-if="settings?.avatarPath"
          :src="settings.avatarPath"
          :alt="`${settings.name} profile picture`"
          width="32"
          height="32"
          class="size-8 shrink-0 rounded-full border border-base-300 object-cover"
        />
        <span class="truncate">{{ settings?.name || 'Portfolio' }}</span>
      </NuxtLink>

      <div class="hidden items-center gap-1 md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.key"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
        >
          {{ link.title }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle"
          aria-label="Toggle color theme"
          @click="toggle"
        >
          <ClientOnly>
            <Sun v-if="theme === 'portfolio'" class="size-5" aria-hidden="true" />
            <Moon v-else class="size-5" aria-hidden="true" />
          </ClientOnly>
        </button>

        <!-- Auth control (PUB-11): sign-in link, or avatar dropdown when signed in -->
        <a
          v-if="!loggedIn"
          href="/api/auth/github"
          rel="nofollow"
          class="btn btn-outline btn-sm gap-2"
          aria-label="Sign in with GitHub"
        >
          <Github class="size-4" aria-hidden="true" />
          <span class="hidden sm:inline">Sign in with GitHub</span>
          <span class="sm:hidden">Sign in</span>
        </a>

        <div v-else-if="user" class="dropdown dropdown-end">
          <button type="button" class="btn btn-ghost btn-sm gap-2 px-2" aria-haspopup="menu">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="`${user.username}'s avatar`"
              class="size-6 rounded-full"
              width="24"
              height="24"
            />
            <span class="hidden max-w-32 truncate sm:inline">{{ user.username }}</span>
            <ChevronDown class="size-4" aria-hidden="true" />
          </button>
          <ul
            class="menu dropdown-content z-50 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li class="pointer-events-none px-3 py-1 text-xs text-base-content/50">
              Signed in as <span class="font-medium text-base-content/80">{{ user.username }}</span>
            </li>
            <li v-if="user.role === 'ADMIN'">
              <NuxtLink to="/admin" class="gap-2">
                <LayoutDashboard class="size-4" aria-hidden="true" />
                Admin panel
              </NuxtLink>
            </li>
            <li>
              <a href="/api/auth/logout" rel="nofollow" class="gap-2">
                <LogOut class="size-4" aria-hidden="true" />
                Sign out
              </a>
            </li>
          </ul>
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle md:hidden"
          :aria-expanded="menuOpen"
          aria-label="Toggle navigation menu"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="size-5" aria-hidden="true" />
          <Menu v-else class="size-5" aria-hidden="true" />
        </button>
      </div>
    </nav>

    <div v-if="menuOpen" class="border-t border-base-300 bg-base-100 md:hidden">
      <div class="mx-auto flex w-full max-w-6xl flex-col px-4 py-2 sm:px-6">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.key"
          :to="link.to"
          class="rounded-md px-3 py-3 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
          @click="menuOpen = false"
        >
          {{ link.title }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
