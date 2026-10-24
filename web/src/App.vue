<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <header class="border-b">
      <div class="mx-auto flex h-14 max-w-5xl items-center px-4">
        <RouterLink to="/" class="flex items-center gap-2 font-bold">
          <FileText class="size-5 text-primary" aria-hidden="true" />
          FoculessPDF
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <!-- Keyed by path so switching tools resets the page state. -->
      <RouterView :key="$route.path" />
    </main>

    <Toaster rich-colors position="top-center" />
  </div>
</template>
