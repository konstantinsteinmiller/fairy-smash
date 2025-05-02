<script setup lang="ts">
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
</script>

<template lang="pug">
  div.absolute.bottom-0.left-0(class="z-[150] w-[500px] h-80")
    div.banner
      div.slider(style="--quantity: 8")
        div.item.relative(v-for="(model, index) in modelsList" :key="index" :style="`--position: ${index + 1}`")
          img.w-full.h-full.object-contain.rounded-md.shadow-md(:src="model" :alt="`Model ${index + 1}`")
</template>

<style lang="css">
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
  left: calc(50% - 60px);
  transform-style: preserve-3d;
  transform: perspective(1000px);
  animation: autoRun 20s linear infinite;
  z-index: 2;
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
}
.banner .slider .item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media screen and (max-width: 1023px) {
  .banner .slider {
    width: 160px;
    height: 200px;
    left: calc(50% - 80px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(300px);
  }
}
@media screen and (max-width: 767px) {
  .banner .slider {
    width: 100px;
    height: 150px;
    left: calc(50% - 50px);
  }
  .banner .slider .item {
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(180px);
  }
}
</style>
