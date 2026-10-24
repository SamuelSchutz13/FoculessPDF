<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tools } from '@/lib/tools'
</script>

<template>
  <section class="mx-auto max-w-2xl py-10 text-center">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Todas as ferramentas de PDF em um só lugar</h1>
    <p class="mt-3 text-muted-foreground">
      Junte, divida, gire e organize seus PDFs direto no navegador. Gratuito e sem cadastro.
    </p>
  </section>

  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="tool in tools" :key="tool.id">
      <RouterLink
        v-if="tool.available"
        :to="`/${tool.id}`"
        class="block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <component :is="tool.icon" class="mb-2 size-7 text-primary" aria-hidden="true" />
            <CardTitle>{{ tool.title }}</CardTitle>
            <CardDescription>{{ tool.description }}</CardDescription>
          </CardHeader>
        </Card>
      </RouterLink>

      <Card v-else class="h-full opacity-60" aria-disabled="true">
        <CardHeader>
          <component :is="tool.icon" class="mb-2 size-7 text-muted-foreground" aria-hidden="true" />
          <CardTitle class="flex items-center gap-2">
            {{ tool.title }}
            <Badge variant="secondary">Em breve</Badge>
          </CardTitle>
          <CardDescription>{{ tool.description }}</CardDescription>
        </CardHeader>
      </Card>
    </li>
  </ul>
</template>
