<script setup lang="ts">
import style from '@/assets/scss/base.module.scss'
</script>

<template>
  <ul :class="style.appList">
    <slot />
  </ul>
</template>
