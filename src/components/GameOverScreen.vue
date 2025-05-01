<script setup lang="ts">
import XButton from '@/components/atoms/XButton.vue'
import { cleanupLevel } from '@/Game'
import router from '@/router'
import $ from '@/global'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { client } from '@/utils/mpClient.ts'
import { onBeforeUnmount, type Ref, ref } from 'vue'
const { t } = useI18n()

const route = useRoute()

const backToMainMenu = () => {
  cleanupLevel(false, true)
  setTimeout(() => {
    router.push({ name: 'main-menu', query: route.query })
  }, 100)
}

const entitiesList = ref(Array.from($.entitiesMap.values()))
const fairy = entitiesList.value.find(entity => entity.userId === client?.myActor()?.userId)

const hasFled: Ref<boolean> = ref(client.myActor().getCustomProperties()?.hasFled)

const hasWon: Ref<boolean> = ref(!client.myActor().getCustomProperties()?.isDead)

const updateUuid = $.addEvent('renderer.update', () => {
  fairy.value = entitiesList.value.find(entity => entity.userId === client?.myActor()?.userId)
  const customProps = client.myActor().getCustomProperties()
  hasFled.value = !!customProps?.hasFled

  hasWon.value = !customProps?.isDead
  // console.log('Game Over fairy: ', customProps, hasFled.value /*, entitiesList.value*/)

  if (hasFled.value) {
    $.removeEvent('renderer.update', updateUuid)
  }
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount - GameOverScreen')
  client.myActor().setCustomProperties({
    hasFled: undefined,
    isDead: undefined,
    hp: undefined,
  })
  $.removeEvent('renderer.update', updateUuid)
})
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
      <!--      <h1 class="text-red-800 lg:text-[8rem] text-[5rem] shrink-0 text-center">GAME OVER</h1>-->
      <template v-if="!hasFled">
        <h2
          class="lg:text-[6rem] text-[4rem] shrink-0 text-center"
          :class="{
            'text-green-600': hasWon,
            'text-red-800': !hasWon,
          }"
        >
          {{ hasWon ? t('won') : t('lost') }}
        </h2>
        <h2
          class="text-white lg:text-[4rem] text-[2rem] shrink-0 text-center"
          :class="{ 'glass ': hasWon }"
        >
          {{ hasWon ? t('wonSubtitle') : t('lostSubtitle') }}
        </h2>
      </template>
      <h3
        v-else
        class="glass lg:text-[3rem] text-[2rem] shrink-0 text-center"
      >
        {{ t('fled') }}
      </h3>

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
  lost: "You've lost!"
  lostSubtitle: "You were not able to extract fairy dust from the battlefield."
  won: "You've won!"
  wonSubtitle: "Congratulations! You earned some fairy dust."
  fled: "You have successfully extracted your gathered fairy dust."
de:
  backToMainMenu: "Zurück zum Hauptmenü"
  continue: "Weiter"
  lost: "Du hast verloren!"
  lostSubtitle: "Du hast es nicht geschafft, den Feenstaub vom Schlachtfeld zu extrahieren."
  won: "Gewonnen!"
  wonSubtitle: "Herzlichen Glückwunsch! Du hast etwas Feenstaub verdient."
  fled: "Du hast erfolgreich deinen gesammelten Feenstaub extrahiert."
</i18n>
