import ArenaPlayerController from '@/entity/ArenaPlayerController.ts'
import { cleanupLevel } from '@/Game.ts'
import $ from '@/global'
import type { Guild } from '@/types/entity.ts'
import { Vector3 } from 'three'
import World from '@/entity/World'
import Crosshair from '@/entity/Crosshair'
import { assetManager } from '@/engine/AssetLoader.ts'
import { client } from '@/utils/mpClient.ts'
import RemoteController from '@/entity/RemoteController.ts'

const Arena = async (level: string) => {
  World(level, () => {
    $.level.spawnPointMap = assetManager.assets.spawnPointMap
    // const fairyPoseSPList = Array.from($.level.spawnPointMap)
    //   ?.filter((sp: any) => {
    //     return sp[1]?.type === ('pose' as SpawnPoint)
    //   })
    //   .map((sp: any) => sp[1])

    const actorsList = client.sortedActors || []
    const startingPositions: any[] = client.myRoom().getCustomProperties()?.startPositions

    /* testing single player */
    if (actorsList.length === 0) {
      const startPos = startingPositions.shift()?.position

      ArenaPlayerController({
        actorNr: client.myActor().actorNr,
        userId: client.getUserId(),
        modelPath: '/models/nature-fairy-1/nature-fairy-1.fbx',
        stats: {
          name: client.myActor().name,
          hp: 100,
          previousHp: 100,
          mp: 50,
          previousMp: 50,
        },
        startPosition: new Vector3(startPos.x, startPos.y, startPos.z),
        startRotation: startPos.quaternion,
        modelHeight: 1.8,
        guild: 'guild-0' as Guild,
      })
      return
    }

    /* mp */
    actorsList.forEach((actor: any, actorIndex) => {
      const startPos = startingPositions[actorIndex]?.position

      if (client.isMyActor(actor)) {
        ArenaPlayerController({
          actorNr: actor.actorNr,
          userId: actor.userId,
          modelPath: actor.customProperties.modelPath || '/models/nature-fairy-1/nature-fairy-1.fbx',
          stats: {
            name: actor.name,
            hp: 100,
            previousHp: 100,
            mp: 100,
            previousMp: 100,
          },
          startPosition: new Vector3(startPos.x, startPos.y, startPos.z),
          // startPosition: actor.customProperties.modelPath.includes('dragon-young')
          //   ? new Vector3(-15.13, 23.43, 14.31)
          //   : new Vector3(startPos.x, startPos.y, startPos.z),
          startRotation: startPos.quaternion,
          modelHeight: 1.8,
          guild: 'guild-0' as Guild,
        })
      } else {
        RemoteController({
          actorNr: actor.actorNr,
          userId: actor.userId,
          modelPath: actor.customProperties.modelPath,
          stats: {
            name: actor.name,
            hp: 100,
            previousHp: 100,
            mp: 100,
            previousMp: 100,
          },
          startPosition: new Vector3(startPos.x, startPos.y, startPos.z),
          startRotation: startPos.quaternion,
          modelHeight: 1.8,
          guild: 'guild-1' as Guild,
        })
      }
    })

    Crosshair()

    $.addEvent('battle.cleanup', () => {
      cleanupLevel(true, true)
      $.showCursor = true
      $.controls.removePointerLock()
    })

    const arenaEndEventUuid = $.addEvent('renderer.update', () => {
      if ($.isBattleOver) {
        $.removeEvent('renderer.update', arenaEndEventUuid)
        $.triggerEvent('battle.cleanup')
      }
    })

    $.isWorldInitialized = true
    $.loadingManager.itemEnd('loading-screen')
  })
}
export default Arena
