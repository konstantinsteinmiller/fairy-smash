import AIController from '@/entity/AIController.ts'
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
import { getRandomStartPoints } from '@/utils/function.ts'

const Arena = async (level: string, players: number = 2) => {
  World(level, () => {
    $.level.spawnPointMap = assetManager.assets.spawnPointMap

    const startingPositions: any[] = [
      /*
      {
        x: -4.97,
        y: -1.24,
        z: 14.66,
      },
      {
        x: -0.97,
        y: 3.91,
        z: 14.79,
      },
      {
        x: 2.32,
        y: -1.98,
        z: 14.87,
      },
      {
        x: -5.19,
        y: 4.02,
        z: 14.73,
      },*/
    ]

    // console.log('client: ', client, client.actorsArray)
    const actorsList = client.actorsArray || []
    console.log('actorsList: ', actorsList)

    const playerCount = actorsList?.length
    getRandomStartPoints(startingPositions, playerCount)

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
    actorsList.forEach((actor: any) => {
      const startPos = startingPositions.shift()?.position

      if (client.isMyActor(actor)) {
        ArenaPlayerController({
          actorNr: actor.actorNr,
          userId: actor.userId,
          modelPath: actor.customProperties.modelPath || '/models/nature-fairy-1/nature-fairy-1.fbx',
          stats: {
            name: actor.name,
            hp: 5,
            previousHp: 100,
            mp: 50,
            previousMp: 50,
          },
          startPosition: new Vector3(startPos.x, startPos.y, startPos.z),
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
            hp: 4,
            previousHp: 100,
            mp: 50,
            previousMp: 50,
          },
          startPosition: new Vector3(startPos.x, startPos.y, startPos.z),
          startRotation: startPos.quaternion,
          modelHeight: 1.8,
          guild: 'guild-1' as Guild,
        })
      }
    })

    // AIController({
    //   modelPath: '/models/nature-fairy-1/nature-fairy-1.fbx',
    //   stats: { name: 'enemy' },
    //   startPosition: new Vector3(startPos2.x, startPos2.y, startPos2.z),
    //   startRotation: startPos2.quaternion,
    //   modelHeight: 1.8,
    //   guild: 'guild-1' as Guild,
    // })

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
