<script setup lang="ts">
import WebApp from '@twa-dev/sdk'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppListEdit from '@/components/AppListEdit.vue'
import AppListShared from '@/components/AppListShared.vue'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()

const appStore = useAppStore()

function shareWishlist() {
  const appUrl = `https://t.me/${__TG_BOT_NAME__}?startapp=${appStore.wishlist.shareId}`
  const shareUrl = new URL('https://t.me/share/url')
  shareUrl.searchParams.set('url', appUrl)

  WebApp.openTelegramLink(shareUrl.toString())
}

function createOwnWishlist() {
  WebApp.openTelegramLink(`https://t.me/${__TG_BOT_NAME__}?startapp`)
}
</script>

<template>
  <div :class="style.appLayout">
    <div :class="style.appPanel">
      <div :class="style.appTitle">
        <AppUserPhoto
          v-if="appStore.wishlist.createdBy?.photoUrl"
          :src="appStore.wishlist.createdBy.photoUrl"
          :alt="`${appStore.wishlistCreatorUsername}'s photo`"
          :class="style.appTitlePhoto"
        />
        <div :class="style.appTitleText">
          {{ appStore.wishlistCreatorUsername }}
        </div>
        <button :class="style.appTitleAction" @click="shareWishlist">
          {{ t('common.share') }}
        </button>
      </div>
    </div>

    <div :class="style.appPanel">
      <AppListEdit v-if="appStore.userIsCreator" />
      <AppListShared v-else />
    </div>

    <div v-if="!appStore.userIsCreator" :class="style.appPanel">
      <button :class="style.appListAction" @click="createOwnWishlist">
        {{ t('wishlist.newList') }}
      </button>
    </div>
  </div>
</template>
