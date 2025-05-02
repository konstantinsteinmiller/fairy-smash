import AssetLoader from '@/engine/AssetLoader.ts'
import ArenaCharacterFSM from '@/states/ArenaCharacterFSM.ts'
import type { Guild, LevelType } from '@/types/entity.ts'
import { calcRapierMovementVector } from '@/utils/collision.ts'
import { type ANIM } from '@/utils/constants.ts'
import { LEVELS } from '@/utils/enums.ts'
import { createEntityColliderBox, createRigidBodyEntity } from '@/utils/physics.ts'
import { Object3D, Quaternion, Vector3 } from 'three'
import $ from '@/global'
import { getBaseStats } from '@/utils/controller.ts'
import { client } from '@/utils/mpClient.ts'

interface ControllerProps {
  id?: string
  modelPath: string
  startPosition: Vector3
  startRotation: Quaternion
  modelHeight: number
  stats?: any
  guild: Guild
  levelType: LevelType
  animationNamesList: ANIM[]
}

const Controller = ({
  id,
  modelPath,
  startPosition,
  modelHeight,
  stats = {},
  guild,
  animationNamesList,
}: ControllerProps) => {
  let entity: any | Object3D = null
  let mesh: any = new Object3D()
  mesh.position.copy(startPosition)

  entity = {
    ...new Object3D(),
    id,
    position: startPosition.clone(),
    ...getBaseStats(),
    ...stats,
    guild,
    mesh,
    animationNamesList,
    halfHeight: modelHeight * 0.5,
  }
  entity.calcHalfHeightPosition = (entity: any): Vector3 => {
    return entity.mesh.position.clone().add(new Vector3(0, entity.halfHeight, 0))
  }

  let mixer: any = {}
  const animationsMap: any = {}
  const stateMachine = new ArenaCharacterFSM(animationsMap, entity)

  // const animationNamesList = levelType === LEVELS.ARENA ? characterAnimationNamesList : worldCharacterAnimationNamesList
  entity.stateMachine = stateMachine
  entity.currentVelocity = new Vector3(0, 0, 0)

  entity.playAnimation = (name: string) => {
    if (entity.stateMachine.currentState) {
      entity.stateMachine.setState(name)
    }
  }

  const loadModels = async () => {
    const { loadCharacterModelWithAnimations } = AssetLoader()
    await loadCharacterModelWithAnimations({
      modelPath,
      parent: $.scene,
      position: startPosition,
      scale: 0.01,
      animationsMap,
      animationNamesList,
      callback: (scope: any) => {
        mixer = scope.mixer
        mesh = scope.mesh
        mesh.entityId = `${entity.uuid}`
        entity.mesh = mesh
        entity.mesh.updateMatrixWorld(true)

        entity.center = entity.calcHalfHeightPosition(entity)
        createEntityColliderBox(entity)

        stateMachine.setState('idle')

        $.triggerEvent('model.loaded', entity)
        $.triggerEvent(`${entity.id}-loaded`, entity)
      },
    })
  }

  const initPhysics = () => {
    const { rigidBody, collider } = createRigidBodyEntity({ position: startPosition, entity })
    entity.rigidBody = rigidBody
    entity.collider = collider
  }

  loadModels()
  initPhysics()

  const updatePosition = (deltaS: number) => {
    const movementVector = calcRapierMovementVector(entity, entity.currentVelocity, deltaS)
    entity.rigidBody.setNextKinematicRotation(entity.getRotation())
    entity.rigidBody.setNextKinematicTranslation(movementVector)

    /* correct mesh position in physics capsule */
    const meshPos = new Vector3(0, -entity.halfHeight, 0).add(entity.rigidBody.translation())
    // Update Three.js Mesh Position
    entity.position.copy(meshPos)
    mesh.position.copy(meshPos)
    entity.center = entity.calcHalfHeightPosition(entity)

    const remoteActor = client.findActor(entity.userId)
    const remoteData = remoteActor?.getCustomProperties?.() || {}

    /* receive position data from client actor */
    if (remoteData.rotation) {
      if (entity.hp !== remoteData.hp) {
        const damage = entity.hp - remoteData.hp
        entity.dealDamage(entity, damage)
      }

      if (entity.currency !== remoteData.currency) {
        entity.currency = remoteData.currency
      }

      if (remoteData.triggerHit) {
        entity.stateMachine.setState('hit')
        remoteActor.setCustomProperties({ triggerHit: undefined })
      }
      // if (entity.stateMachine.currentState !== remoteData.currentState) {
      //   entity.stateMachine.setState(remoteData.currentState)
      //   remoteActor.setCustomProperties({
      //     currentState: entity.stateMachine.currentState,
      //   })
      // }
    }

    client.myActor().setCustomProperties({
      hp: entity.hp,
      currency: entity.currency,
      rotation: {
        w: entity.mesh.quaternion.w,
        x: entity.mesh.quaternion.x,
        y: entity.mesh.quaternion.y,
        z: entity.mesh.quaternion.z,
      },
      movementVector: {
        x: movementVector.x,
        y: movementVector.y,
        z: movementVector.z,
      },
      meshPos: { x: meshPos.x, y: meshPos.y, z: meshPos.z },
      center: { x: entity.center.x, y: entity.center.y, z: entity.center.z },
      currentVelocity: { x: entity.currentVelocity.x, y: entity.currentVelocity.y, z: entity.currentVelocity.z },
    })
  }

  entity.update = (deltaS: number) => {
    if (!entity.mesh || stateMachine.currentState === null || $.loadingManager.isLoading || !$.isWorldInitialized) {
      return false
    }

    updatePosition(deltaS)

    mixer?.update?.(deltaS)

    return true
  }

  return entity
}

export default Controller
