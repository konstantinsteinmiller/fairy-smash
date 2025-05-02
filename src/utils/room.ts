import { client } from '@/utils/mpClient.ts'
import useUser from '@/use/useUser.ts'
import { assetManager } from '@/engine/AssetLoader.ts'
import type { SpawnPoint } from '@/types/world.ts'

export const checkRoomGameOver = (entity: any) => {
  const actor = client.findActor(entity)
  actor?.setCustomProperties({
    isDead: entity?.isDead(entity),
  })
}

export const storeFairyDust = () => {
  const { setSettingValue, userFairyDust } = useUser()

  const myCustomProps = client.myActor().getCustomProperties()
  userFairyDust.value = userFairyDust.value + myCustomProps?.currency.fairyDust
  setSettingValue('fairyDust', userFairyDust.value)
  client.myActor().setCustomProperties({
    currency: undefined,
  })
}

if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this[i], this[j]] = [this[j], this[i]]
    }
    return this
  }
}
export const getShuffledStartPositions = () => {
  return Array.from(assetManager.assets?.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('player' as SpawnPoint)
    })
    .map((sp: any) => sp[1])
    .shuffle()
}

const modelsList = [
  '/models/nature-fairy-1/nature-fairy-1.fbx',
  '/models/dragon-young/dragon-young.fbx',
  '/models/thunder-fairy-1/thunder-fairy-1.fbx',
  '/models/yeti-young/yeti-young.fbx',
  '/models/dragon-old/dragon-old.fbx',
  '/models/psi-nightmare/psi-nightmare.fbx',
  '/models/mushroom-middle/mushroom-middle.fbx',
  '/models/fire-harpy/fire-harpy.fbx',
].shuffle()

export const pickPlayerModels = () => {
  const sortedActorsList = client.sortedActors || []
  sortedActorsList.forEach((actor, index) => actor.setCustomProperties({ modelPath: modelsList[index] }))
}
