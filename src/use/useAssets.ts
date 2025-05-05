import { assetManager } from '@/engine/AssetLoader.ts'
import { characterAnimationNamesList } from '@/utils/constants.ts'
import { prependBaseUrl } from '@/utils/function.ts'
import { ref } from 'vue'
import $ from "@/global.ts";

const loadingProgress = ref(0)
const areAllAssetsLoaded = ref(false)

export default () => {
  const arenaAssetsList: string[] = [
    prependBaseUrl('/draco/draco_decoder.js'),
    '/worlds/arenas/mountain-arena.comp.glb',
    '/worlds/arenas/mountain-arena-navmesh.fbx',
    '/models/items/power-ups-low-poly/swords.comp.glb',
    '/models/items/power-ups-low-poly/breast_plate.comp.glb',
    '/models/items/power-ups-low-poly/heal.comp.glb',
    '/models/items/power-ups-low-poly/power-up.comp.glb',
    '/images/glow.png',
    '/images/star/star-64x64.png',
    '/images/fairy-dust/fairy-dust-100x120.png',
    '/images/icons/fairy.png',
    '/images/crosshair/crosshair-transparent.avif',
    '/images/crosshair/crosshair-stars.png',
    '/images/crosshair/crosshair-dots.avif',
    '/images/logo/fairy-smash-royale-logo_256x256.png',
  ]
  const characterAnimsList = [
    '/models/nature-fairy-1/nature-fairy-1.fbx',
    '/models/thunder-fairy-1/thunder-fairy-1.fbx',
    '/models/yeti-young/yeti-young.fbx',
    '/models/dragon-young/dragon-young.fbx',
    '/models/dragon-old/dragon-old.fbx',
    '/models/fire-harpy/fire-harpy.fbx',
    '/models/psi-nightmare/psi-nightmare.fbx',
    // '/models/mushroom-middle/mushroom-middle.fbx',
  ]
  const spawnPointsList = ['/worlds/arenas/mountain-arena-spawn-points.comp.glb']

  let promisesLength = 1
  const updateProgress = () => {
    loadingProgress.value += +(100 / promisesLength).toFixed(2)
  }

  const mapMeshesAndTextures = (src: string) => {
    if (src.endsWith('.fbx') || src.endsWith('.glb') || src.endsWith('.gltf')) {
      return assetManager.loadMesh(src)
    } else if (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.avif')) {
      return assetManager.loadTexture(src)
    }
  }

  const preloadAssets = async () => {
    if (areAllAssetsLoaded.value) return
    try {
      // Load assets in parallel
      arenaAssetsList
        .map(mapMeshesAndTextures)
        .concat([
          assetManager.loadCubeTexture([
            '/images/skybox/px.avif',
            '/images/skybox/nx.avif',
            '/images/skybox/py.avif',
            '/images/skybox/ny.avif',
            '/images/skybox/pz.avif',
            '/images/skybox/nz.avif',
          ]),
          // .then(updateProgress),
        ])
        .concat(
          characterAnimsList.reduce((acc, src) => {
            if (src.endsWith('.fbx') || src.endsWith('.glb') || src.endsWith('.gltf')) {
              acc.concat(assetManager.loadCharacterAnims({ src, animsList: characterAnimationNamesList }))
            }
            return acc
          }, [])
        )
        .concat(
          spawnPointsList.reduce((acc, src) => {
            if (src.endsWith('.fbx') || src.endsWith('.glb') || src.endsWith('.gltf')) {
              acc.concat(assetManager.loadMesh(src))
            }
            return acc
          }, [])
        )
      let resolvedPromises = 0
      promisesLength = assetManager.loadingPromises.length
      await Promise.all(
        assetManager.loadingPromises.map(promise => promise?.then(updateProgress).then(() => resolvedPromises++))
      )

      // await Promise.all(assetManager.loadingPromises.map(promise => promise?.then(updateWorldProgress)))

      const interval = setInterval(async () => {
        areAllAssetsLoaded.value = true
        assetManager.loadingPromises = []
        // console.log('All assets preloaded successfully', assetManager)

        // console.log('resolvedPromises: ', resolvedPromises, promisesLength)
        if (resolvedPromises === promisesLength) {
          // console.log('done - resolvedPromises: ', resolvedPromises, promisesLength)
          loadingProgress.value = 100
          $.sdkInitialized && CrazyGames.SDK.game.loadingStop()
        }
        interval && clearInterval(interval)
      }, 200)
    } catch (error) {
      console.error('Asset loading error:', error)
    }
  }

  return {
    loadingProgress,
    preloadAssets,
  }
}
