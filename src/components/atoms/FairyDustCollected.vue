<script setup lang="ts">
import useMatch from '@/use/useMatch.ts'
import { LEVELS } from '@/utils/enums.ts'
import { onMounted, onUnmounted, type Ref, ref, watch } from 'vue'
import $ from '@/global.ts'
import useUser from '@/use/useUser.ts'

const fairyDust: Ref<number> = ref(0)
const { levelType, isStartingGame } = useMatch()
const { userFairyDust } = useUser()

let updateUuid: string = ''

watch(
  () => userFairyDust.value,
  () => {
    if (!isStartingGame.value && fairyDust.value !== userFairyDust.value) {
      fairyDust.value = userFairyDust.value
    }
  }
)

onMounted(() => {
  if (!isStartingGame.value && fairyDust.value !== userFairyDust.value) {
    fairyDust.value = userFairyDust.value
  }

  updateUuid = $.addEvent('renderer.update', () => {
    if (isStartingGame.value && fairyDust.value !== $.player?.currency?.fairyDust) {
      fairyDust.value = $.player?.currency?.fairyDust
    }
  })
})

onUnmounted(() => {
  $.removeEvent('renderer.update', updateUuid)
})
</script>

<template>
  <div
    v-if="fairyDust >= 0 /* && !$.isMenu*/"
    class="fixed right-2 bottom-16 w-10 z-[5]"
    :class="{
      '!bottom-2': levelType === LEVELS.WORLD || !isStartingGame,
    }"
  >
    <div class="relative flex flex-col gap-0 items-end justify-center">
      <div
        class="text-white text-2xl self-center p-2 pb-0 -mb-[4.9rem] -mr-0 z-10"
        style="
          text-shadow:
            0 0 3px black,
            -1px -1px 4px black;
        "
      >
        {{ fairyDust }}
      </div>
      <img
        src="/images/fairy-dust/fairy-dust-100x120.png"
        alt="fairy-dust-icon"
        class="h-12 mb-6 w-auto"
      />
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
