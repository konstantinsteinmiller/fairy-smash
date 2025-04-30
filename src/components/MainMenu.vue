<script setup lang="ts">
import LoadingBar from '@/components/LoadingBar.vue'
import { spraySprincles } from '@/control/KeyboardController.ts'
import Camera from '@/engine/Camera.ts'
import FileLoader from '@/engine/FileLoader.ts'
import Sound from '@/engine/Sound.ts'
import router from '@/router'
import $ from '@/global'
import useAssets from '@/use/useAssets.ts'
import useMatch from '@/use/useMatch.ts'
import { findPointer, onUnlockedMouseMove, showCustomPointer } from '@/utils/find-pointer.ts'
import { onMounted, onUnmounted, type Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OptionsModal from '@/components/OptionsModal.vue'
import XButton from '@/components/atoms/XButton.vue'
import { useRoute } from 'vue-router'
import { client } from '@/utils/mpClient.ts'
import RoomsModal from '@/components/RoomsModal.vue'
import CreateGameModal from '@/components/CreateGameModal.vue'
import GameRoomModal from '@/components/GameRoomModal.vue'
import useUser from '@/use/useUser.ts'
import {GAME_USER_NAME_LABEL} from "@/utils/constants.ts";

const { isStartingGame } = useMatch()
const route = useRoute()
$.route.value = route

const { t } = useI18n()
const isOptionsModalOpen = ref(false)
const isCreatGameModalOpen = ref(false)
const isGameRoomOpen = ref(false)
const isRoomsModalOpen = ref(false)
const isNative = import.meta.env.VITE_PLATTFORM === 'native'

showCustomPointer()

const startArena = () => {
  isStartingGame.value = true
  router.push({ name: 'battle', params: { worldId: 'mountain-arena' }, query: route.query })
}

const onExit = () => {
  console.log('exit game')
}

const setPointer = async () => {
  const { clientX, clientY }: any = await findPointer()
  onUnlockedMouseMove({ clientX, clientY })
}
setPointer()

!$.sounds && Sound()

!$.fileLoader && FileLoader()
!$.camera && Camera()

const { preloadAssets, loadingProgress } = useAssets()

const game$: any = document.querySelector('.game')

let onceBackgroundMusic = false
const onClick = (e: MouseEvent) => {
  if ($.sounds && !onceBackgroundMusic) {
    $.sounds.playBackgroundMusic()
    onceBackgroundMusic = true
  }
  spraySprincles(e)
}

onMounted(() => {
  preloadAssets()
  game$.addEventListener('click', onClick, false)
  game$.addEventListener('mousemove', onUnlockedMouseMove, false)
})
onUnmounted(() => {
  game$.removeEventListener('click', onClick, false)
  game$.removeEventListener('mousemove', onUnlockedMouseMove, false)
})

const showJoinRoom: Ref<boolean> = ref(false)
const { userPlayerName } = useUser()
client.on('joinedLobby', () => {
  const localStorageUserName = localStorage.getItem(GAME_USER_NAME_LABEL)
  // const userPlayerName: Ref<string> = ref()
  // console.log('joined lobby')
  client.myActor().setName(localStorageUserName ?? `AwesomePlayer${Math.ceil(Math.random() * 1000)}`)
  showJoinRoom.value = true
})
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-full">
    <img
      class="absolute top-0 left-0 w-full h-full"
      src="@/assets/documentation/promotion/loading_screen_ethereal_vistas_1280x720.jpg"
      alt="loading-screen-artwork"
    />

    <div class="relative top-4 left-0 bg-transparent flex justify-center items-start w-full h-[200px]">
      <img
        class="w-auto h-[200px] z-[5]"
        src="@/assets/documentation/fairy-smash-royale-banner_609x372.png"
        alt="logo"
      />
    </div>

    <div class="flex w-full my-3 mt-1 mt-8">
      <div class="mx-auto">
        <div class="flex justify-center">
          <XButton
            class="with-bg mt-3 leading-[1rem]"
            :disabled="loadingProgress < 99.8"
            @click="startArena"
            @keydown.enter="startArena"
          >
            {{ t('startArena') }}
          </XButton>
        </div>

        <div class="flex justify-center">
          <XButton
            class="with-bg mt-3 leading-[1rem]"
            @click="() => (isCreatGameModalOpen = true)"
          >
            {{ t('createGame') }}
          </XButton>
        </div>

        <!--        <div class="flex justify-center">-->
        <!--          <XButton-->
        <!--            class="with-bg mt-3 leading-[1rem]"-->
        <!--            :disabled="!showJoinRoom"-->
        <!--            @click="client.joinGame('test')"-->
        <!--            @keydown.enter="startArena"-->
        <!--          >-->
        <!--            {{ t('createRoom') }}-->
        <!--          </XButton>-->
        <!--        </div>-->

        <div class="flex justify-center">
          <XButton
            class="mt-3 with-bg"
            :disabled="!showJoinRoom"
            @click="() => (isRoomsModalOpen = true)"
            >{{ t('rooms') }}
          </XButton>
        </div>

        <div class="flex justify-center">
          <XButton
            class="mt-3 with-bg"
            @click="() => (isOptionsModalOpen = true)"
            >{{ t('options') }}
          </XButton>
        </div>

        <OptionsModal
          :show="isOptionsModalOpen"
          @close="() => (isOptionsModalOpen = false)"
        />
        <CreateGameModal
          :show="isCreatGameModalOpen"
          @close="() => (isCreatGameModalOpen = false)"
          @created-room="() => (console.log('created-room'), (isGameRoomOpen = true))"
        />
        <GameRoomModal
          :show="isGameRoomOpen"
          @close="() => (isGameRoomOpen = false)"
          @left-room="() => (isRoomsModalOpen = true)"
        />
        <RoomsModal
          :show="isRoomsModalOpen"
          @close="() => (isRoomsModalOpen = false)"
          @joined-room="() => (isGameRoomOpen = true)"
        />

        <div
          v-if="isNative"
          class="flex justify-center"
        >
          <XButton
            class="mt-3 with-bg"
            @click="onExit"
            >{{ t('quit') }}
          </XButton>
        </div>
      </div>
    </div>
    <LoadingBar />
  </div>
</template>

<i18n>
en:
  createGame: "Create Game"
  options: "Options"
  quit: "Quit game"
de:
  createGame: "Spiel erstellen"
  options: "Einstellungen"
  quit: "Spiel beenden"
</i18n>
