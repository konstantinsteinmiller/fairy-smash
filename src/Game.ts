import Camera from '@/engine/Camera.ts'
import FileLoader from '@/engine/FileLoader.ts'
import Sound from '@/engine/Sound.ts'
import $ from '@/global'
import useUser from '@/use/useUser.ts'
import { destroyVfx } from '@/utils/vfx.ts'
import { Scene } from 'three'
import Light from '@/engine/Light'
import Renderer from '@/engine/Renderer'
import Physics from '@/engine/Physics'
import { client } from '@/utils/mpClient.ts'

export default async (level: string) => {
  await Physics()

  !$.sounds && Sound()
  !$.fileLoader && FileLoader()
  !$.camera && Camera()

  $.scene = new Scene()
  $.uiScene = new Scene()

  $.addEvent('level.cleanup', () => {
    $.scene = null
    $.uiScene = null
  })

  const levelConfig = await import(`@/entity/levels/${level}/config.ts`)
  const { phi, theta } = levelConfig.startPositions[0]?.orientation || { phi: 0, theta: 0 }

  $.personCamera.setCameraRotation(phi, theta)

  Light()
  Renderer()

  return true
}

export const cleanupLevel = (excludeBattleProtected = false, removeVfx = false) => {
  client?.actorsArray?.forEach(actor =>
    actor?.setCustomProperties({
      isOverDriveMode: undefined,
    })
  )

  $.sounds.stop('background')
  $.sounds.stop('battle')
  if (excludeBattleProtected) {
    const { userMusicVolume } = useUser()
    $.sounds.play('battleEnd', { volume: 1.5 * userMusicVolume.value * 0.25, loop: true })
  } else {
    $.sounds.stop('battleEnd')
  }

  $.uiScene?.traverse((child: any) => {
    // console.log('child: ', child)
    if (child) {
      $.uiScene.remove(child)
      child.geometry?.dispose?.()
      child.material?.dispose?.()
      child = null
    }
  })
  const children: any = []
  $?.scene?.traverse?.((child: any) => {
    if (child) {
      if (excludeBattleProtected && child.isBattleProtected) return
      children.push(child)
    }
  })
  children.reverse().forEach((child: any) => {
    child.geometry?.dispose?.()
    child.material?.dispose?.()
    $.scene.remove(child)
    child = null
  })

  if (removeVfx) {
    $.vfxList.forEach(({ /*name, */ vfxRenderer, nebulaSystem }: any) => {
      setTimeout(() => {
        destroyVfx({ nebulaSystem: nebulaSystem, vfxRenderer })
      }, 3000)
    })
  }
  if (!excludeBattleProtected) {
    $.isEngineInitialized = false
    $.isBattleOver = false
    $.isWorldInitialized = false
    $.player.currency.fairyDust = 0
    $.entitiesMap.clear()

    const fileLoader = FileLoader()
    fileLoader.clearData()
    $.triggerEvent('level.cleanup')
    $.clearAllEvents()

    // $.renderer.dispose()
    setTimeout(() => {}, 1000)
  }
}
