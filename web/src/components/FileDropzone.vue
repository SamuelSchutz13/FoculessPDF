<script setup lang="ts">
import { Upload } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MAX_FILE_SIZE_MB } from '@/lib/api'

defineProps<{ accept: string; multiple: boolean }>()
const emit = defineEmits<{ add: [files: File[]] }>()
const { t } = useI18n()

const input = ref<HTMLInputElement>()
const dragging = ref(false)

function onDrop(event: DragEvent) {
  dragging.value = false
  emit('add', [...(event.dataTransfer?.files ?? [])])
}

function onPick() {
  if (!input.value) return
  emit('add', [...(input.value.files ?? [])])
  // Reset so picking the same file again still fires "change".
  input.value.value = ''
}
</script>

<template>
  <!-- A label around the input keeps it keyboard and screen-reader accessible. -->
  <label
    class="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring"
    :class="dragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <Upload class="size-8 text-muted-foreground" aria-hidden="true" />
    <span class="font-medium">{{ multiple ? t('dropzone.multiple') : t('dropzone.single') }}</span>
    <span class="text-sm text-muted-foreground">
      {{ t('dropzone.limit', { size: `${MAX_FILE_SIZE_MB} MB` }) }}
    </span>
    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="accept"
      :multiple="multiple"
      @change="onPick"
    />
  </label>
</template>
