<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()
</script>

<template>
  <!-- Shows the language you'd switch to, labelled in that language. -->
  <Button
    variant="ghost"
    size="sm"
    class="font-semibold"
    :aria-label="t('app.switchLanguage')"
    :title="t('app.switchLanguage')"
    @click="setLocale(locale === 'en' ? 'pt-BR' : 'en')"
  >
    {{ locale === 'en' ? 'PT' : 'EN' }}
  </Button>
</template>
