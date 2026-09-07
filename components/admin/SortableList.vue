<script setup lang="ts" generic="T extends { id: number }">
import { GripVertical } from 'lucide-vue-next'

// ADM-4: dependency-free HTML5 drag-and-drop reorder list (M4.4 decision: no
// vuedraggable). Emits the full new id order; the parent persists it and
// refetches on error to restore server truth.
const props = defineProps<{
  items: T[]
}>()
const emit = defineEmits<{
  reordered: [ids: number[]]
}>()
defineSlots<{
  default(props: { item: T; index: number }): unknown
}>()

const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)
// Rows become draggable only while the handle is held, so text inputs inside a
// row stay selectable. Reset on mouseup/dragend — never mid-drag.
const armed = ref(false)

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(props.items[index]?.id ?? ''))
  }
}

function onDragOver(index: number, event: DragEvent) {
  if (dragIndex.value === null) return
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  overIndex.value = index
}

function onDrop(index: number) {
  const from = dragIndex.value
  if (from !== null && from !== index) {
    const moved = [...props.items]
    const [item] = moved.splice(from, 1)
    if (item) {
      moved.splice(index, 0, item)
      emit(
        'reordered',
        moved.map((entry) => entry.id),
      )
    }
  }
  resetDrag()
}

function onDragEnd() {
  resetDrag()
}

function resetDrag() {
  dragIndex.value = null
  overIndex.value = null
  armed.value = false
}
</script>

<template>
  <ul class="space-y-2">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2 transition-opacity"
      :class="{
        'opacity-40': dragIndex === index,
        'ring-2 ring-primary/40': overIndex === index && dragIndex !== null && dragIndex !== index,
      }"
      :draggable="armed"
      @dragstart="onDragStart(index, $event)"
      @dragover.prevent="onDragOver(index, $event)"
      @drop.prevent="onDrop(index)"
      @dragend="onDragEnd"
    >
      <button
        type="button"
        class="cursor-grab text-base-content/40 hover:text-base-content"
        aria-label="Drag to reorder"
        @mousedown="armed = true"
        @mouseup="armed = false"
      >
        <GripVertical class="size-4" aria-hidden="true" />
      </button>
      <div class="min-w-0 flex-1">
        <slot :item="item" :index="index" />
      </div>
    </li>
  </ul>
</template>
