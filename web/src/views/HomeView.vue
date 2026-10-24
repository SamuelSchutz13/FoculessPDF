<script setup lang="ts">
import { EyeOff, MegaphoneOff, UserX } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import ToolIcon from '@/components/ToolIcon.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tools } from '@/lib/tools'

const { t } = useI18n()

const promises = [
  { icon: MegaphoneOff, key: 'home.noAds' },
  { icon: EyeOff, key: 'home.noTelemetry' },
  { icon: UserX, key: 'home.noSignup' },
]
</script>

<template>
  <section class="mx-auto max-w-2xl py-10 text-center">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t('home.title') }}</h1>
    <p class="mt-3 text-muted-foreground">{{ t('home.subtitle') }}</p>
    <ul class="mt-6 flex flex-wrap justify-center gap-2">
      <li
        v-for="promise in promises"
        :key="promise.key"
        class="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
      >
        <component :is="promise.icon" class="size-4" aria-hidden="true" />
        {{ t(promise.key) }}
      </li>
    </ul>
  </section>

  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="tool in tools" :key="tool.id">
      <RouterLink
        :to="`/${tool.id}`"
        class="block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Card class="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader class="flex flex-row items-start gap-4">
            <ToolIcon :tool="tool" />
            <div class="flex flex-col gap-1.5">
              <CardTitle>{{ t(`tools.${tool.id}.title`) }}</CardTitle>
              <CardDescription>{{ t(`tools.${tool.id}.description`) }}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </RouterLink>
    </li>
  </ul>
</template>
