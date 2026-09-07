import type { Ref } from 'vue'

// ADM-17: warn when leaving a page with unsaved edits — in-app navigation via
// vue-router, tab close/reload via beforeunload. Pages track `dirty` (usually a
// JSON snapshot comparison) and clear it after a successful save.
export function useUnsavedGuard(dirty: Ref<boolean>) {
  onBeforeRouteLeave(() => {
    if (dirty.value && !window.confirm('Discard unsaved changes?')) {
      return false
    }
  })

  if (import.meta.client) {
    useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
      if (!dirty.value) return
      event.preventDefault()
      event.returnValue = ''
    })
  }
}
