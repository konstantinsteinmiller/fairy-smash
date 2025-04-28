<script setup lang="ts">
import { onMounted, onUnmounted, type Ref, ref } from 'vue'
import $ from '@/global.ts'

const powerUp: Ref<number> = ref(0)

let updateUuid: string = ''

onMounted(() => {
  updateUuid = $.addEvent('renderer.update', () => {
    if (powerUp.value !== $.player?.currency?.powerUp && $.player?.currency?.powerUp !== undefined) {
      powerUp.value = $.player?.currency?.powerUp
    }
  })
})

onUnmounted(() => {
  $.removeEvent('renderer.update', updateUuid)
})
</script>

<template>
  <div class="fixed right-2 bottom-[9rem] w-10 z-[5]">
    <div class="relative flex flex-col gap-0 items-end justify-center">
      <div
        class="text-white text-2xl self-center p-2 pb-0 -mb-[4.6rem] -mr-0 z-10"
        style="
          text-shadow:
            0 0 3px black,
            -1px -1px 4px black;
        "
      >
        {{ powerUp }}
      </div>
      <img
        src="/images/icons/power-up-pickup_256x256.png"
        alt="fairy-dust-icon"
        class="h-12 mb-4 w-auto"
      />
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
