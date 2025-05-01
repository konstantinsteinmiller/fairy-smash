<template>
  <template v-if="!isBattleOver">
    <img
      class="absolute top-1 left-4 w-16 h-16"
      src="/images/logo/fairy-smash-royale-logo_256x256.png"
      alt="logo"
    />
    <StatBar
      owner-id="enemy"
      type="life"
    />
    <StatBar
      owner-id="player"
      type="life"
    />
    <StatBar
      owner-id="player"
      type="mana"
    />
    <StatBar
      owner-id="player"
      type="endurance"
    />

    <BuffsList />
  </template>
  <template v-else>
    <GameOverScreen v-if="isOnlyOnePlayerLeft || fledGame" />
  </template>

  <LoadingScreen :level="worldId" />
</template>

<script setup lang="ts">
import BuffsList from '@/components/molecules/BuffsList.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import GameOverScreen from '@/components/GameOverScreen.vue'
import StatBar from '@/components/StatBar.vue'
import $ from '@/global'
import Game from '@/Game'
import useMatch from '@/use/useMatch.ts'
import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'
import { useRoute } from 'vue-router'
import { GAME_LAST_ROOM } from '@/utils/constants.ts'
import { client } from '@/utils/mpClient.ts'

useMatch()
const route = useRoute()

const worldId: Ref<string> = ref(route.params.worldId)

const isBattleOver: Ref<boolean> = ref(!!$?.isBattleOver)
const isOnlyOnePlayerLeft: Ref<boolean> = ref(false)
const fledGame: Ref<boolean> = ref(false)

onMounted(async () => {
  await Game(worldId.value)

  const updateUuid = $.addEvent('renderer.update', () => {
    const haveMyFled = !!client.myActor().getCustomProperties()?.hasFled

    if (
      client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead || actor.getCustomProperties()?.hasFled)
        .length >=
      client.actorsArray.length - 1
    ) {
      console.log(
        'client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead).length: ',
        client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead || actor.getCustomProperties()?.hasFled)
          .length
      )
      console.log('client.actorsArray.length: ', client.actorsArray.length)

      $.isBattleOver = true
    }

    if ($.isBattleOver || haveMyFled) {
      console.log('haveMyFled: ', haveMyFled)
      fledGame.value = haveMyFled
      isBattleOver.value = true
      isOnlyOnePlayerLeft.value = $.isBattleOver
      $.removeEvent('renderer.update', updateUuid)
    }
  })
})

onBeforeUnmount(() => {
  console.log('client.isJoinedToRoom(): ', client, client.isJoinedToRoom())
  // debugger
  if (client.isJoinedToRoom()) {
    localStorage.setItem(GAME_LAST_ROOM, client.myRoom().name)
    client.leaveRoom()
  }
  client.disconnect()
})
</script>

<style scoped lang="sass"></style>
