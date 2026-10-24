<script setup lang="ts">
import { ArrowLeft, LoaderCircle } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
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
import { ApiError, runTool } from '@/lib/api'
import { saveFile } from '@/lib/download'
import type { Tool } from '@/lib/tools'

const props = defineProps<{ tool: Tool }>()

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
  // Quick client-side check for a friendlier message; the API validates the real content.
  const accepted = added.filter((file) => props.tool.accept.split(',').includes(file.type))
  for (const file of added.filter((file) => !accepted.includes(file))) {
    toast.warning(`"${file.name}" não é um arquivo ${props.tool.acceptLabel} e foi ignorado.`)
  }

  files.value = multiple.value ? [...files.value, ...accepted] : accepted.slice(0, 1)
  if (files.value.length > props.tool.maxFiles) {
    toast.warning(`Máximo de ${props.tool.maxFiles} arquivos.`)
    files.value = files.value.slice(0, props.tool.maxFiles)
  }
}

function moveFile(index: number, offset: number) {
  const next = [...files.value]
  const [file] = next.splice(index, 1)
  next.splice(index + offset, 0, file)
  files.value = next
}

async function submit() {
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
    toast.success(`Pronto! ${result.filename} foi baixado.`)
  } catch (error) {
    const messages = error instanceof ApiError ? error.messages : ['Erro inesperado.']
    toast.error('Não foi possível processar o arquivo', { description: messages.join('\n') })
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
      <ArrowLeft class="size-4" aria-hidden="true" /> Todas as ferramentas
    </RouterLink>

    <header class="flex items-center gap-3">
      <component :is="tool.icon" class="size-8 text-primary" aria-hidden="true" />
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ tool.title }}</h1>
        <p class="text-muted-foreground">{{ tool.description }}</p>
      </div>
    </header>

    <FileDropzone :accept="tool.accept" :multiple="multiple" @add="addFiles" />

    <FileList
      v-if="files.length"
      :files="files"
      :reorderable="multiple"
      @remove="files.splice($event, 1)"
      @move="moveFile"
    />
    <p v-if="tool.minFiles > 1 && files.length < tool.minFiles" class="text-sm text-muted-foreground">
      Adicione pelo menos {{ tool.minFiles }} arquivos.
    </p>

    <form v-if="tool.fields.length" class="flex flex-col gap-4" @submit.prevent="submit">
      <div v-for="field in tool.fields" :key="field.name" class="flex flex-col gap-2">
        <Label :for="field.name">
          {{ field.label }}
          <span v-if="field.type === 'text' && !field.required" class="font-normal text-muted-foreground">
            (opcional)
          </span>
        </Label>

        <Select v-if="field.type === 'select'" v-model="values[field.name]">
          <SelectTrigger :id="field.name" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <template v-else>
          <Input
            :id="field.name"
            v-model="values[field.name]"
            :type="field.secret ? 'password' : 'text'"
            :autocomplete="field.secret ? 'off' : undefined"
            :placeholder="field.placeholder"
            :aria-describedby="field.hint ? `${field.name}-hint` : undefined"
          />
          <p v-if="field.hint" :id="`${field.name}-hint`" class="text-sm text-muted-foreground">
            {{ field.hint }}
          </p>
        </template>
      </div>
    </form>

    <div class="flex flex-col gap-3">
      <Button size="lg" :disabled="!canSubmit" @click="submit">
        <LoaderCircle v-if="progress !== null" class="animate-spin" aria-hidden="true" />
        {{ progress === null ? tool.title : progress < 100 ? `Enviando… ${progress}%` : 'Processando…' }}
      </Button>
      <Progress v-if="progress !== null" :model-value="progress" aria-label="Progresso do envio" />
    </div>
  </div>
</template>
