import type { Guild } from '@/types/entity.ts'
import useUser from '@/use/useUser.ts'
import { characterAnimationNamesList } from '@/utils/constants.ts'
import { LEVELS } from '@/utils/enums.ts'
import { isPlayerInPoisonCloud } from '@/vfx/poison-cloud.ts'
import { Quaternion, Vector3 } from 'three'
import $ from '@/global'
import { statsUtils, controllerUtils } from '@/utils/controller.ts'
import RemoteBaseController from '@/entity/RemoteBaseController.ts'
import { client } from '@/utils/mpClient.ts'
import { checkRoomGameOver } from '@/utils/room.ts'

interface RemoteArenaControllerProps {
  modelPath: string
  startPosition: Vector3
  startRotation: Quaternion
  modelHeight: number
  stats?: any
  guild: Guild
}

const RemoteArenaController = ({
  modelPath,
  startPosition,
  startRotation,
  modelHeight,
  stats = {},
  guild,
}: RemoteArenaControllerProps) => {
  const entity: any = RemoteBaseController({
    modelPath,
    startPosition,
    startRotation,
    modelHeight,
    stats,
    guild,
    levelType: LEVELS.ARENA,
    animationNamesList: characterAnimationNamesList,
  })
  const utils: any = { ...statsUtils(), ...controllerUtils() }
  for (const key in utils) {
    entity[key] = utils[key]
  }

  const { userSoundVolume } = useUser()
  const checkIsCharacterDead = (deltaS: number) => {
    if (entity.isDead(entity)) {
      entity.die(entity, deltaS, userSoundVolume)

      checkRoomGameOver(entity)
      return
    }
    if ($.level.name.toLowerCase().includes('arena') && entity.position.y < -15) {
      entity.dealDamage(entity, entity.hp)
    }
  }

  entity.checkBattleOver = (updateEventUuid: string) => {
    if ($.isBattleOver) {
      $.removeEvent('renderer.update', updateEventUuid)
    }
    if (entity.isDead(entity)) {
      setTimeout(() => {
        $.removeEvent('renderer.update', updateEventUuid)
      }, 500)
    }
  }

  let soundCounter = 1
  const checkPoisonCloud = () => {
    soundCounter++
    const playerPosition = entity.position
    if (isPlayerInPoisonCloud(playerPosition)) {
      entity.dealDamage(entity, 0.1)
      soundCounter % 160 === 0 &&
        $.sounds.addAndPlayPositionalSound(entity, 'cough', { volume: 0.5 * userSoundVolume.value * 0.25 })
    }
  }

  const controllerUpdate = entity.update
  entity.update = (deltaS: number) => {
    const isFinished = controllerUpdate(deltaS)
    if (!isFinished) return false

    checkIsCharacterDead(deltaS)

    checkPoisonCloud()

    return true
  }

  return entity
}

export default RemoteArenaController
