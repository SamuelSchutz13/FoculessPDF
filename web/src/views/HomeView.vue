<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tools } from '@/lib/tools'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-2xl py-10 text-center">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t('home.title') }}</h1>
    <p class="mt-3 text-muted-foreground">{{ t('home.subtitle') }}</p>
  </section>

  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="tool in tools" :key="tool.id">
      <RouterLink
        :to="`/${tool.id}`"
        class="block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <component :is="tool.icon" class="mb-2 size-7 text-primary" aria-hidden="true" />
            <CardTitle>{{ t(`tools.${tool.id}.title`) }}</CardTitle>
            <CardDescription>{{ t(`tools.${tool.id}.description`) }}</CardDescription>
          </CardHeader>
        </Card>
      </RouterLink>
    </li>
  </ul>
</template>
