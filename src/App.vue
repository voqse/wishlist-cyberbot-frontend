<script setup lang="ts">
import WebApp from '@twa-dev/sdk'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'

const { t } = useI18n()

onMounted(() => {
  WebApp.ready()
  WebApp.expand()
})
</script>

<template>
  <h1 :class="style.test">
    {{ t('app.title') }}
  </h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>
