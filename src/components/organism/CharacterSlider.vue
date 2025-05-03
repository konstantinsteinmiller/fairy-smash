<script setup lang="ts">
import { onMounted, ref } from 'vue'

const modelsList = [
  '/models/nature-fairy-1/preview_400x463.jpg',
  '/models/dragon-young/preview_400x463.jpg',
  '/models/thunder-fairy-1/preview_400x463.jpg',
  '/models/yeti-young/preview_400x463.jpg',
  '/models/dragon-old/preview_400x463.jpg',
  '/models/psi-nightmare/preview_400x463.jpg',
  '/models/mushroom-middle/preview_400x463.jpg',
  '/models/fire-harpy/preview_400x463.jpg',
]

const quantity = modelsList.length
const currentIndex = ref(Math.floor(Math.random() * quantity))
const isAutoRotating = ref(true)
const rotationAngle = ref(0)

const emit = defineEmits(['selected'])

const frameSrc = '/images/frames/fancy-frame_512x512.png'

const rotateSlider = () => {
  const slider = document.querySelector('.character-slider .slider') as HTMLElement
  if (slider) {
    slider.style.transform = `perspective(1000px) rotateX(-16deg) rotateY(${rotationAngle.value}deg)`
  }
}

const next = () => {
  rotationAngle.value -= 360 / quantity
  rotateSlider()
  currentIndex.value = (currentIndex.value + 1) % quantity
  isAutoRotating.value = false
  emitSelected()
}

const prev = () => {
  rotationAngle.value += 360 / quantity
  rotateSlider()
  currentIndex.value = (currentIndex.value - 1 + quantity) % quantity
  isAutoRotating.value = false
  emitSelected()
}

const selectItem = (index: number) => {
  const targetAngle = index * (360 / quantity) * -1
  rotationAngle.value = targetAngle
  rotateSlider()
  currentIndex.value = index
  isAutoRotating.value = false
  emitSelected()
}

// Initial rotation to center the first item
rotationAngle.value = 0
rotateSlider()

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'KeyA') {
    prev()
  } else if (event.key === 'ArrowRight' || event.key === 'KeyD') {
    next()
  }
})

const emitSelected = () => {
  const modelParts = modelsList[currentIndex.value].split('/')
  const modelId = modelParts[2] || 'nature-fairy-1'
  emit('selected', modelId)
}
onMounted(() => {
  emitSelected()
})
</script>

<template lang="pug">
  div.character-slider.absolute.left-0(class="z-[150] w-[500px] -bottom-[22rem] h-80 flex items-center justify-center gap-4")
    button.absolute.left-2.bg-gray-800.text-white.rounded-full.p-2.shadow-md(
      class="top-1/2 -translate-y-1/2 z-[151]"
      @click="prev"
      aria-label="Previous Model"
    )
      svg.w-6.h-6(fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg")
        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7")
    div.banner.relative
      div.slider(:style="`--quantity: ${quantity}`" :class="{ 'auto-rotate': isAutoRotating }")
        div.item.relative(
          v-for="(model, index) in modelsList"
          :key="index"
          :style="`--position: ${index + 1}`"
          @click="selectItem(index)"
        )
          div.relative.w-full.h-full
            img.w-full.h-full.object-contain.rounded-md.shadow-md(:src="model" :alt="`Model ${index + 1}`"
              :class="{ '': index === currentIndex }"
            )
            img.frame.absolute.inset-0.w-full.h-full(
              :src="frameSrc"
              alt="Frame"
              v-if="index === currentIndex"
              class="scale-[112%] pointer-events-none w-[120px] h-[150px]"
            )
    button.absolute.right-2.bg-gray-800.text-white.rounded-full.p-2.shadow-md(
      class="top-1/2 -translate-y-1/2 z-[151]"
      @click="next"
      aria-label="Next Model"
    )
      svg.w-6.h-6(fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg")
        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7")
</template>

<style lang="css" scoped>
.banner {
  width: 100%;
  height: 20rem;
  text-align: center;
  overflow: hidden;
  position: relative;
}
.banner .slider {
  position: absolute;
  width: 120px;
  height: 150px;
  top: 10%;
  left: calc(50% - 50px);
  transform-style: preserve-3d;
  transform: perspective(1000px) rotateX(-16deg) rotateY(0deg);
  z-index: 2;
  transition: transform 0.5s ease-in-out;
}

.banner .slider.auto-rotate {
  animation: autoRun 20s linear infinite;
}

@keyframes autoRun {
  from {
    transform: perspective(1000px) rotateX(-16deg) rotateY(0deg);
  }
  to {
    transform: perspective(1000px) rotateX(-16deg) rotateY(360deg);
  }
}

.banner .slider .item {
  position: absolute;
  inset: 0 0 0 0;
  transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(175px);
  cursor: pointer;
}
.banner .slider .item img:not(.frame) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner .slider .item img.frame {
  width: 100%;
  height: 100%;
}
@media screen and (max-width: 1023px) {
  .banner .slider {
    width: 140px;
    height: 180px;
    left: calc(50% - 80px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(150px);
  }
}
@media screen and (max-width: 767px) {
  .banner .slider {
    width: 80px;
    height: 100px;
    left: calc(50% - 50px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(110px);
  }
}
@media screen and (max-width: 567px) {
  .banner .slider {
    width: 50px;
    height: 60px;
    left: calc(50% - 50px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(90px);
  }
}
</style>
