import { assetManager } from '@/engine/AssetLoader.ts'
import MountainArena from '@/entity/levels/mountain-arena/MountainArena.ts'
import $ from '@/global'
import * as THREE from 'three'

export default (level: string, onFinishedCallback: () => void) => {
  createSkybox()

  switch (level) {
    case 'mountain-arena':
      MountainArena(onFinishedCallback)
      break
    default:
      console.log('Unknown level: ', level)
  }
}

function createSkybox () {
  const environmentMap: any = assetManager.getTexture('/images/skybox/px.avif')
  environmentMap.encoding = (THREE as any).sRGBEncoding
  $.scene.background = environmentMap
  $.scene.environment = environmentMap
}
