export interface AppToast {
  id: number
  kind: 'success' | 'error'
  message: string
}

let nextToastId = 0

// ADM-16: global toast store. Toasts render via components/AppToasts.vue,
// mounted once in both layouts (admin + public — engagement toasts in M6).
export function useToast() {
  const toasts = useState<AppToast[]>('app-toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(kind: AppToast['kind'], message: string) {
    const id = ++nextToastId
    toasts.value.push({ id, kind, message })
    setTimeout(() => dismiss(id), 4000)
  }

  return {
    toasts: readonly(toasts),
    dismiss,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
  }
}

// FetchError from $fetch carries the h3 error body on `data` — prefer its
// message (e.g. 409 "Slug is already taken"), then the status message.
export function apiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { data?: { message?: string }; statusMessage?: string } | null
  return err?.data?.message || err?.statusMessage || fallback
}
