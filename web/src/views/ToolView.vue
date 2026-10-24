<script setup lang="ts">
import { ArrowLeft, LoaderCircle } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import FileDropzone from '@/components/FileDropzone.vue'
import FileList from '@/components/FileList.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, MAX_FILE_SIZE_MB, runTool } from '@/lib/api'
import { formatSize, saveFile } from '@/lib/download'
import type { Tool } from '@/lib/tools'

const props = defineProps<{ tool: Tool }>()
const { t, te } = useI18n()

/** i18n key of a field text, e.g. tools.split.fields.ranges.label */
const fieldKey = (name: string, part: string) => `tools.${props.tool.id}.fields.${name}.${part}`
const title = computed(() => t(`tools.${props.tool.id}.title`))

const files = ref<File[]>([])
const values = reactive<Record<string, string>>(
  Object.fromEntries(
    props.tool.fields.map((field) => [field.name, field.type === 'select' ? field.default : '']),
  ),
)
/** Upload percentage while a request is running, null when idle. */
const progress = ref<number | null>(null)

const multiple = computed(() => props.tool.maxFiles > 1)
const canSubmit = computed(
  () =>
    progress.value === null &&
    files.value.length >= props.tool.minFiles &&
    props.tool.fields.every(
      (field) => field.type !== 'text' || !field.required || values[field.name]?.trim(),
    ),
)

function addFiles(added: File[]) {
  // Quick client-side checks for friendlier messages; the API validates the real content.
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
  const accepted = added.filter((file) => {
    if (!props.tool.accept.split(',').includes(file.type)) {
      toast.warning(t('tool.wrongType', { name: file.name, kind: t(`accept.${props.tool.acceptKind}`) }))
      return false
    }
    if (file.size > maxBytes) {
      toast.warning(t('tool.tooBig', { name: file.name, size: `${MAX_FILE_SIZE_MB} MB` }))
      return false
    }
    return true
  })

  files.value = multiple.value ? [...files.value, ...accepted] : accepted.slice(0, 1)
  if (files.value.length > props.tool.maxFiles) {
    toast.warning(t('tool.maxFiles', { count: props.tool.maxFiles }))
    files.value = files.value.slice(0, props.tool.maxFiles)
  }
}

function moveFile(index: number, offset: number) {
  const next = [...files.value]
  const [file] = next.splice(index, 1)
  next.splice(index + offset, 0, file)
  files.value = next
}

function sizeReport(resultSize: number): string | undefined {
  if (!props.tool.reportsSize) return undefined
  const originalSize = files.value.reduce((total, file) => total + file.size, 0)
  if (resultSize >= originalSize) return t('tool.alreadyOptimized')
  return t('tool.sizeReport', {
    from: formatSize(originalSize),
    to: formatSize(resultSize),
    percent: Math.round((1 - resultSize / originalSize) * 100),
  })
}

async function submit() {
  if (!canSubmit.value) return
  const form = new FormData()
  for (const file of files.value) form.append(props.tool.fileField, file)
  for (const [name, value] of Object.entries(values)) {
    if (value.trim()) form.append(name, value.trim())
  }

  progress.value = 0
  try {
    const result = await runTool(props.tool.endpoint, form, (percent) => {
      progress.value = percent
    })
    saveFile(result)
    toast.success(t('tool.done', { filename: result.filename }), {
      description: sizeReport(result.blob.size),
    })
  } catch (error) {
    const messages = error instanceof ApiError ? error.messages : [t('api.unexpected')]
    toast.error(t('tool.failed'), { description: messages.join('\n') })
  } finally {
    progress.value = null
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-2xl flex-col gap-6">
    <RouterLink
      to="/"
      class="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="size-4" aria-hidden="true" /> {{ t('tool.back') }}
    </RouterLink>

    <header class="flex items-center gap-3">
      <component :is="tool.icon" class="size-8 text-primary" aria-hidden="true" />
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1>
        <p class="text-muted-foreground">{{ t(`tools.${tool.id}.description`) }}</p>
      </div>
    </header>

    <FileDropzone :accept="tool.accept" :multiple="multiple" @add="addFiles" />

    <template v-if="files.length">
      <FileList
        :files="files"
        :reorderable="multiple"
        @remove="files.splice($event, 1)"
        @move="moveFile"
      />
      <Button
        v-if="files.length > 1"
        variant="ghost"
        size="sm"
        class="w-fit self-end"
        :disabled="progress !== null"
        @click="files = []"
      >
        {{ t('tool.clear') }}
      </Button>
    </template>
    <p v-if="tool.minFiles > 1 && files.length < tool.minFiles" class="text-sm text-muted-foreground">
      {{ t('tool.minFiles', { count: tool.minFiles }) }}
    </p>

    <form v-if="tool.fields.length" class="flex flex-col gap-4" @submit.prevent="submit">
      <div v-for="field in tool.fields" :key="field.name" class="flex flex-col gap-2">
        <Label :for="field.name">
          {{ t(fieldKey(field.name, 'label')) }}
          <span v-if="field.type === 'text' && !field.required" class="font-normal text-muted-foreground">
            {{ t('tool.optional') }}
          </span>
        </Label>

        <Select v-if="field.type === 'select'" v-model="values[field.name]">
          <SelectTrigger :id="field.name" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
              {{ t(fieldKey(field.name, `options.${option.key}`)) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <template v-else>
          <Input
            :id="field.name"
            v-model="values[field.name]"
            :type="field.secret ? 'password' : 'text'"
            :autocomplete="field.secret ? 'off' : undefined"
            :placeholder="t(fieldKey(field.name, 'placeholder'))"
            :aria-describedby="te(fieldKey(field.name, 'hint')) ? `${field.name}-hint` : undefined"
          />
          <p
            v-if="te(fieldKey(field.name, 'hint'))"
            :id="`${field.name}-hint`"
            class="text-sm text-muted-foreground"
          >
            {{ t(fieldKey(field.name, 'hint')) }}
          </p>
        </template>
      </div>
    </form>

    <div class="flex flex-col gap-3">
      <Button size="lg" :disabled="!canSubmit" @click="submit">
        <LoaderCircle v-if="progress !== null" class="animate-spin" aria-hidden="true" />
        {{
          progress === null
            ? title
            : progress < 100
              ? t('tool.sending', { percent: progress })
              : t('tool.processing')
        }}
      </Button>
      <Progress v-if="progress !== null" :model-value="progress" :aria-label="t('tool.progress')" />
    </div>
  </div>
</template>
