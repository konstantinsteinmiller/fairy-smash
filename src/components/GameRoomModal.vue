<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VModal from '@/components/atoms/VModal.vue'
import { computed, onBeforeUnmount, onMounted, type Ref, ref, watch } from 'vue'
import XButton from '@/components/atoms/XButton.vue'
import { client } from '@/utils/mpClient.ts'
import { MP_EVENTS } from '@/utils/enums.ts'
import Actor = Photon.LoadBalancing.Actor
import { useRoute, useRouter } from 'vue-router'
import useMatch from '@/use/useMatch.ts'
import { getShuffledStartPositions } from '@/utils/room.ts'
import CharacterSlider from '@/components/organism/CharacterSlider.vue'
import useUser from '@/use/useUser.ts'
import $ from '@/global.ts'

const { t }: any = useI18n({ useScope: 'local' })
const router = useRouter()
const route = useRoute()
const { isStartingGame } = useMatch()
const { userSoundVolume } = useUser()

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(['close', 'left-room'])

const gameName: Ref<string> = ref('')

const onClose = () => {
  emit('close')
}

const isReady: Ref<boolean> = ref(false)
const readyMap: Ref<Map<number, boolean>> = ref(new Map())

const updateActors = () => {
  setTimeout(() => {
    let actors = client.myRoomActors()
    const actorsList = Object.values(actors) || []
    // console.log('actorsList: ', actorsList, client.myRoom()?.loadBalancingClient.actorsArray)
    playersList.value = actorsList as Actor[]
  }, 200)
}

const toggleReady = (event: any) => {
  let target = event.target
  if (target.classList.contains('button-bg')) {
    target = target.parentElement
  }
  target.classList.toggle('button--on')
  isReady.value = !isReady.value

  readyMap.value.set(client.myActor().actorNr, isReady.value)
  setReadyPlayersCount()
  client.myActor().setCustomProperties({
    isReady: isReady.value,
  })
  client.raiseEvent(MP_EVENTS.READY, {
    message: `${isReady.value}`,
  })
}
const areAllPlayersReady = computed(() => {
  return readyPlayersCount.value === playersList.value.length
})

client.on('READY', ({ data, actorNr }: { data: { message: string }; actorNr: number }) => {
  readyMap.value.set(actorNr, JSON.parse(data.message))
  setReadyPlayersCount()
})
client.on('LEAVE_ROOM', ({ data, actorNr }: { data: { message: string }; actorNr: number }) => {
  readyMap.value.set(actorNr, false)
  setReadyPlayersCount()
  // console.log('LEAVE_ROOM actorNr: ', actorNr)
  updateActors()
})
const readyPlayersCount = ref(client.actorsList.filter((actor: Actor) => readyMap.value.get(actor.actorNr))?.length)
const setReadyPlayersCount = () => {
  readyPlayersCount.value = client.actorsList.filter((actor: Actor) => readyMap.value.get(actor.actorNr))?.length
}
const playersList: Ref<Actor[]> = ref([])

client.on('playerJoined', ({ actor }: { actor: any }) => {
  // console.log('playerJoined: ', actor.name, client.myRoomActors())
  if (client.isMyActor(actor)) {
    isReady.value = false
  }
  readyMap.value.set(actor.actorNr, false)
  setReadyPlayersCount()

  updateActors()

  client.raiseEvent(MP_EVENTS.READY, {
    message: `${actor.actorNr !== client.myActor().actorNr ? isReady.value : false}`,
  })
})

const onLeave = () => {
  readyMap.value.set(client.myActor().actorNr, false)
  setReadyPlayersCount()
  client.onLeaveRoom()
  emit('close')
}
client.on('onLeftRoom', () => {
  emit('left-room')
})

onBeforeUnmount(() => {
  !isStartingGame.value && onLeave()
})

const playerCount = ref(0)
const refreshRooms = () => {
  // const room = client.availableRooms()
  // console.log('room: ', client.myRoom())
  client.showAvailableRooms(rooms => {})
  playerCount.value = client.myRoom().playerCount
}

watch(
  () => props.show,
  () => {
    if (props.show) {
      $.sounds.addAndPlaySound('hello', { volume: 0.55 * userSoundVolume.value * 1 })
      refreshRooms()
      updateActors()
      setTimeout(() => {
        playerCount.value = client.myRoom().playerCount
      }, 300)

      client.myRoom().setCustomProperties({
        hasMatchStarted: false,
      })
    }
  }
)

watch(
  () => playersList.value,
  () => {
    playersList.value.forEach((player: Actor) => {
      if (readyMap.value.get(player.actorNr) === undefined) {
        readyMap.value.set(player.actorNr, false)
        setReadyPlayersCount()
      }
    })
  },
  { immediate: true }
)

const startArena = () => {
  isStartingGame.value = true

  router.push({ name: 'battle', params: { worldId: 'mountain-arena' }, query: route.query })
}
const onStartGame = () => {
  client.myRoom().setCustomProperties({
    startPositions: getShuffledStartPositions(),
    hasMatchStarted: true,
  })

  // pickPlayerModels()
  $.sounds.addAndPlaySound('go', { volume: userSoundVolume.value * 0.5 })
  client.raiseEvent(MP_EVENTS.START_GAME, {
    message: `starting game`,
  })
  startArena()
}
client.on('START_GAME', ({ data }: { data: { message: string } }) => {
  $.sounds.addAndPlaySound('go', { volume: 0.5 * userSoundVolume.value })
  startArena()
})
const onSelectedFairy = (modelId: string) => {
  client.myActor().setCustomProperties({
    modelPath: `/models/${modelId}/${modelId}.fbx`,
  })
}
</script>

<template>
  <VModal
    v-if="show"
    :is-dialog="true"
    @close="onClose"
  >
    <template #title>
      <h1 class="mb-4 text-2xl">{{ t('gameName') }}: {{ client.myRoom().name }}</h1>
    </template>
    <template #description>
      <div class="w-full max-w-80 flex flex-col justify-between items-center gap-2">
        <div class="w-full mb-6">
          <div class="mb-4 grid grid-cols-2 text-left">
            <h5>{{ t('players') }}</h5>
            <!--            <div class="text-green-500">{{ playerCount }} / {{ client.myRoom().maxPlayers }}</div>-->
            <h5>
              {{ t('readyPlayers') }}&nbsp;
              <span class="text-green-500">{{ readyPlayersCount }} / {{ playersList.length }}</span>
            </h5>
          </div>
          <div
            v-for="player in playersList"
            :key="player?.actorNr"
            class="mb-6 grid grid-cols-2 text-left"
          >
            <h4 class="text-green-500">
              {{ player?.name }}
            </h4>
            <XButton
              v-if="player?.actorNr === client.myActor().actorNr"
              ref="readyButton"
              class="input-button leading-[0.5rem]"
              :class="{ 'bg-gray-200 text-black border-green-500 pointer-disabled': gameName?.length < 3 }"
              @click="toggleReady"
              @keydown.enter="toggleReady"
            >
              {{ isReady ? t('ready') : t('notReady') }}
            </XButton>
            <div
              v-else
              class="rounded-full w-6 h-6 justify-self-center items-center"
              :style="`background: radial-gradient(circle 1rem at center, ${readyMap.get(player?.actorNr) ? 'green' : 'red'} 20%, transparent)`"
            ></div>
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="flex justify-center items-center gap-4 relative">
        <XButton @click="onLeave">{{ t('leaveGame') }}</XButton>
        <XButton
          v-if="areAllPlayersReady && playersList.length >= 2"
          @click="onStartGame"
          >{{ t('startGame') }}</XButton
        >
      </div>
      <div class="relative w-full">
        <CharacterSlider @selected="onSelectedFairy" />
      </div>
    </template>
  </VModal>
</template>

<style scoped lang="scss"></style>

<i18n>
en:
  ready: "Ready"
  notReady: "Not Ready"
  startGame: "Start Game"
  gameName: "Game"
  readyPlayers: "Ready Players"
de:
  ready: "Bereit"
  notReady: "Nicht Bereit"
  startGame: "Spiel Starten"
  gameName: "Spiel"
  readyPlayers: "Bereite Spieler"
</i18n>
