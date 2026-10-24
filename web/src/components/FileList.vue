<script setup lang="ts">
import { ArrowDown, ArrowUp, FileText, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { formatSize } from '@/lib/download'

defineProps<{ files: File[]; reorderable: boolean }>()
const emit = defineEmits<{ remove: [index: number]; move: [index: number, offset: number] }>()
const { t } = useI18n()
</script>

<template>
  <ol class="flex flex-col gap-2">
    <li
      v-for="(file, index) in files"
      :key="`${file.name}-${file.lastModified}-${index}`"
      class="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
    >
      <FileText class="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ file.name }}</span>
      <span class="shrink-0 text-xs text-muted-foreground">{{ formatSize(file.size) }}</span>

      <template v-if="reorderable">
        <Button
          variant="ghost"
          size="icon"
          :disabled="index === 0"
          :aria-label="t('fileList.moveUp', { name: file.name })"
          @click="emit('move', index, -1)"
        >
          <ArrowUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          :disabled="index === files.length - 1"
          :aria-label="t('fileList.moveDown', { name: file.name })"
          @click="emit('move', index, 1)"
        >
          <ArrowDown />
        </Button>
      </template>
      <Button
        variant="ghost"
        size="icon"
        :aria-label="t('fileList.remove', { name: file.name })"
        @click="emit('remove', index)"
      >
        <X />
      </Button>
    </li>
  </ol>
</template>
