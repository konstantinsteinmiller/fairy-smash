import AIController from '@/entity/AIController.ts'
import ArenaPlayerController from '@/entity/ArenaPlayerController.ts'
import { cleanupLevel } from '@/Game.ts'
import $ from '@/global'
import type { Guild } from '@/types/entity.ts'
import { Vector3 } from 'three'
import World from '@/entity/World'
import Crosshair from '@/entity/Crosshair'
import { assetManager } from '@/engine/AssetLoader.ts'

const Arena = async (level: string, players: number = 1) => {
  World(level, () => {
    $.level.spawnPointMap = assetManager.assets.spawnPointMap

    const startingPositions: any[] = []
    const positions = $.level.pathfinder.startPositions.slice(0)
    let playerCount = players
    const getRandomStartPoints = () => {
      while (playerCount > 0) {
        const playerSpawnPointsAmount = positions.length
        const randomStartPos = Math.floor(Math.random() * playerSpawnPointsAmount)
        startingPositions.push(positions[randomStartPos])

        /* remove the selected player position from the available */
        positions.splice(randomStartPos, 1)
        playerCount--
      }
    }
    getRandomStartPoints()
    ;[...Array(players)].forEach((_player: any, index: number) => {
      const startWp = startingPositions.shift()
      const startPos = startWp?.position

      ArenaPlayerController({
        modelPath: '/models/thunder-fairy-1/thunder-fairy-1.fbx',
        stats: {
          name: `player ${index}`,
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
