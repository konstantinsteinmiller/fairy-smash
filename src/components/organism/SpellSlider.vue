<script setup lang="ts">
import { onMounted, ref } from 'vue'

const modelsList = [
  '/images/spell-card/shot.png',
  '/images/spell-card/locked-card.png',
  '/images/spell-card/locked-card.png',
  '/images/spell-card/locked-card.png',
  '/images/spell-card/locked-card.png',
  '/images/spell-card/locked-card.png',
]

const quantity = modelsList.length
const currentIndex = ref(Math.floor(Math.random() * quantity))
const isAutoRotating = ref(false)
const rotationAngle = ref(0)

const emit = defineEmits(['selected'])

const frameSrc = '/images/frames/fancy-frame_512x512.png'

const rotateSlider = () => {
  const slider = document.querySelector('.spell-slider .slider') as HTMLElement
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

// const selectItem = (index: number) => {
//   const targetAngle = index * (360 / quantity) * -1
//   rotationAngle.value = targetAngle
//   rotateSlider()
//   currentIndex.value = index
//   isAutoRotating.value = false
//   emitSelected()
// }

// Initial rotation to center the first item
rotationAngle.value = 0
rotateSlider()

const emitSelected = () => {
  emit('selected', 'shot.png')
}
onMounted(() => {
  emitSelected()
})
</script>

<template lang="pug">
  div.spell-slider.absolute.left-0(class="z-[150] w-[500px] bottom-[12.5rem] h-[12rem] flex items-center justify-center gap-4")
    div.banner.relative
      div.slider(:style="`--spell-quantity: ${quantity}`" :class="{ 'auto-rotate': isAutoRotating }")
        div.item.relative(
          v-for="(model, index) in modelsList"
          :key="index"
          :style="`--spell-position: ${index + 1}`"
          @click="selectItem(index)"
        )
          div.relative.w-full.h-full
            img.w-full.h-full.object-fit.rounded-md.shadow-md(:src="model" :alt="`Model ${index + 1}`"
              :class="{ '': index === currentIndex }"
            )
</template>

<style lang="css" scoped>
.banner {
  width: 100%;
  height: 12rem;
  text-align: center;
  overflow: hidden;
  position: relative;
}
.banner .slider {
  position: absolute;
  width: 70px;
  height: 100px;
  top: 10%;
  left: calc(50% - 60px);
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
  transform: rotateY(calc((var(--spell-position) - 1) * (360 / var(--spell-quantity)) * 1deg)) translateZ(120px);
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
    width: 70px;
    height: 100px;
    left: calc(50% - 80px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--spell-position) - 1) * (360 / var(--spell-quantity)) * 1deg)) translateZ(120px);
  }
}
@media screen and (max-width: 767px) {
  .banner .slider {
    width: 60px;
    height: 92px;
    left: calc(50% - 50px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--spell-position) - 1) * (360 / var(--spell-quantity)) * 1deg)) translateZ(95px);
  }
}
@media screen and (max-width: 567px) {
  .spell-slider.absolute {
    bottom: 9rem;
  }
  .banner .slider {
    width: 40px;
    height: 52px;
    left: calc(50% - 50px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--spell-position) - 1) * (360 / var(--spell-quantity)) * 1deg)) translateZ(70px);
  }
}
</style>
