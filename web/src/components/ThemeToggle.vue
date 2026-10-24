<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { isDark } from '@/lib/theme'
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
    :title="isDark ? 'Modo claro' : 'Modo escuro'"
    @click="isDark = !isDark"
  >
    <Sun v-if="isDark" aria-hidden="true" />
    <Moon v-else aria-hidden="true" />
  </Button>
</template>
