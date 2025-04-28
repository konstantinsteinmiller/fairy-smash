<script setup lang="ts">
import XButton from '@/components/atoms/XButton.vue'
import { cleanupLevel } from '@/Game'
import router from '@/router'
import $ from '@/global'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute()

const backToMainMenu = () => {
  cleanupLevel(false, true)
  setTimeout(() => {
    router.push({ name: 'main-menu', query: route.query })
  }, 100)
}
</script>

<template>
  <div class="battle-over-screen fixed top-0 left-0 w-full h-full z-[101]">
    <div class="relative top-4 left-0 bg-transparent flex justify-center items-start w-full h-[200px]">
      <img
        class="max-w-[300] h-[200px] z-[5]"
        src="@/assets/documentation/fairy-smash-royale-banner_609x372.png"
        alt="logo"
      />
    </div>

    <div class="flex flex-col justify-start mt-16 items-center h-full flex-wrap">
      <h1 class="text-red-800 lg:text-[8rem] text-[5rem] shrink-0 text-center">GAME OVER</h1>
      <div class="flex w-full my-3">
        <div class="mx-auto">
          <div class="flex justify-center">
            <XButton
              v-if="!$?.world?.playerRef"
              class="with-bg leading-[1rem]"
              @click="backToMainMenu"
              @keydown.enter="backToMainMenu"
            >
              {{ t('backToMainMenu') }}
            </XButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass"></style>

<i18n>
en:
  backToMainMenu: "Back to Main Menu"
  continue: "Continue"
de:
  backToMainMenu: "Zurück zum Hauptmenü"
  continue: "Weiter"
</i18n>
