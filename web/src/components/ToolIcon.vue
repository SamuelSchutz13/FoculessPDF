<script setup lang="ts">
import { computed } from 'vue'
import { type Tool, tools } from '@/lib/tools'

const props = defineProps<{ tool: Tool }>()

// Cycles through the six pastel tiles in catalog order, so a tool keeps its color everywhere.
const tile = computed(() => (tools.indexOf(props.tool) % 6) + 1)
</script>

<template>
  <span
    class="inline-flex size-12 shrink-0 items-center justify-center rounded-xl"
    :style="{ backgroundColor: `var(--tile-${tile})`, color: `var(--tile-ink-${tile})` }"
  >
    <component :is="tool.icon" class="size-6" aria-hidden="true" />
  </span>
</template>
