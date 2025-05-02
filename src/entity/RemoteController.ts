import type { Guild } from '@/types/entity.ts'
import { chargeUtils, controllerAwarenessUtils, createOverHeadHealthBar } from '@/utils/controller.ts'
import { Quaternion, Vector3 } from 'three'
import { createEnemyMovementStrategy } from '@/entity/MovementStrategy.ts'
import $ from '@/global'
import RemoteArenaController from '@/entity/RemoteArenaController.ts'
import { client } from '@/utils/mpClient.ts'

interface RemoteControllerProps {
  actorNr: number
  userId: string
  modelPath: string
  stats?: any
  startPosition: Vector3
  startRotation: Quaternion
  modelHeight: number
  guild: Guild
}

const RemoteController = (config: RemoteControllerProps) => {
  let entity = RemoteArenaController(config)
  const utils: any = { ...chargeUtils(), ...controllerAwarenessUtils() }
  for (const key in utils) {
    entity[key] = utils[key]
  }

  entity.actorNr = config.actorNr
  entity.userId = config.userId

  entity.getPosition = () => {
    if (!entity.mesh) {
      return new Vector3(0, 0, 0)
    }
    return entity.mesh?.position
  }
  entity.getRotation = () => {
    return entity.mesh.quaternion
  }
  entity.setRotation = (rotation: Quaternion) => {
    if (!entity.mesh) {
      return
    }
    const prevQuat = entity.mesh.quaternion.clone()
    prevQuat.slerp(rotation, 0.2) // Smooth interpolation
    entity.rigidBody.setRotation(prevQuat)
    return entity.mesh.quaternion.copy(prevQuat)
  }

  createOverHeadHealthBar(entity)

  const movementStrategy = createEnemyMovementStrategy()

  let updateEventUuid: string = ''
  const update = (deltaS: number, elapsedTimeInS: number) => {
    if (!entity) return
    const isFinished = entity.update(deltaS, elapsedTimeInS)
    if (!isFinished || !entity) return

    entity.stateMachine.update(deltaS)

    entity.checkBattleOver(updateEventUuid)

    entity.currentVelocity = movementStrategy.calculateVelocity(entity.currentVelocity, deltaS)
  }
  updateEventUuid = $.addEvent('renderer.update', update)

  entity.cleanup = () => {
    $.removeEvent('renderer.update', updateEventUuid)

    entity?.mesh?.geometry?.dispose()
    entity?.mesh?.material?.dispose()
    entity?.mesh && $?.scene?.remove(entity?.mesh)

    entity = null
    $.enemiesList = $.enemiesList.filter(enemy => enemy.userId !== config?.userId)
  }
  client.on('playerLeft', (actor: any) => {
    if (actor.userId !== config.userId) return
    console.warn(`${actor.name} left: `, actor)
    entity?.cleanup()
  })

  $.addEvent('level.cleanup', () => {
    entity?.cleanup()
  })

  $.entitiesMap.set(entity.uuid, entity)
  $.enemiesList.push(entity)

  return entity
}

export default RemoteController
