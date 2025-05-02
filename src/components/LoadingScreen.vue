<template>
  <div
    v-if="isLoading && !haveAllPlayerLoadedAssets"
    class="loading-screen fixed top-0 left-0 w-full h-full z-[101]"
  >
    <img
      class="absolute top-1 left-4 w-16 h-16 z-[102]"
      src="/images/logo/fairy-smash-royale-logo_256x256.png"
      alt="logo"
    />
    <img
      class="absolute top-0 left-0 w-full h-full"
      src="../assets/documentation/promotion/loading_screen_ethereal_vistas_1280x720.jpg"
      alt="loading-screen-artwork"
    />
    <ProgressBar
      :current="current"
      class="scale-150 left-12 bottom-12"
    />
    <!--    show-percentage-->
  </div>
</template>

<script setup lang="ts">
import Arena from '@/Arena.ts'
import ProgressBar from '@/components/ProgressBar.vue'
import FileLoader from '@/engine/FileLoader.ts'
import $ from '@/global'
import useMatch from '@/use/useMatch.ts'
import useUser from '@/use/useUser.ts'
import { LEVELS, MP_EVENTS, TUTORIALS } from '@/utils/enums.ts'
import { startPoisonCloudVFX } from '@/vfx/poison-cloud.ts'
import { computed, type ComputedRef, onMounted, ref } from 'vue'
import { client } from '@/utils/mpClient.ts'

const props = defineProps({
  level: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['loading-finished'])

const { userMusicVolume } = useUser()
const fileLoader = FileLoader()
let isLoading: ComputedRef<boolean> | boolean = fileLoader.isLoading
let current: ComputedRef<number> | number = fileLoader.currentlyLoadedPercent

const { levelType } = useMatch()
const { tutorialPhase } = useUser()
const isArena = props.level.includes('-arena')
const actorsLoadedMap = ref(new Map<number, boolean>())
const haveAllPlayerLoadedAssets = computed(() => {
  return Array.from(actorsLoadedMap.value.values()).filter(v => v).length === client.actorsList.length
})

let hasExecutedInit = false
/* add a one time event, that will execute as soon as the Renderer is initialized
 * and the event will clean up after itself, so it just runs once */
const initEnvironment = () => {
  $.controls.setPointerLock()

  if (levelType.value === LEVELS.ARENA) {
    $.sounds.stop('background')
    $.sounds.play('battle', { volume: 0.25 * userMusicVolume.value * 0.25, loop: true })

    setTimeout(() => {
      tutorialPhase.value = TUTORIALS.CHARACTER_CONTROLS
    }, 3000)
  }
  hasExecutedInit = true
}

client.on('LOADED', data => {
  actorsLoadedMap.value.set(data?.actorNr, true)

  if (haveAllPlayerLoadedAssets.value) {
    initEnvironment()
  }
})

onMounted(() => {
  if (isArena) {
    levelType.value = LEVELS.ARENA
  }

  $.addOneTimeEvent('renderer.update', () => {
    $.fileLoader.loadData(() => {
      if ($.isWorldInitialized && !hasExecutedInit) {
        actorsLoadedMap.value.set(client.myActor().actorNr, true)

        client.raiseEvent(MP_EVENTS.LOADED)

        if (haveAllPlayerLoadedAssets.value) {
          initEnvironment()
        }
      }
    })

    /* load other assets */
    $.sounds.loadSounds()

    switch (props.level) {
      case 'mountain-arena':
        Arena('mountain-arena')
        break
      default:
        break
    }

    if (isArena) {
      startPoisonCloudVFX()
    }
  })
})
</script>

<style scoped lang="sass"></style>
