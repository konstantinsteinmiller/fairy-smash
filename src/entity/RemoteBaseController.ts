import AssetLoader from '@/engine/AssetLoader.ts'
import ArenaCharacterFSM from '@/states/ArenaCharacterFSM.ts'
import type { Guild, LevelType } from '@/types/entity.ts'
import { calcRapierMovementVector } from '@/utils/collision.ts'
import { type ANIM } from '@/utils/constants.ts'
import { createEntityColliderBox, createRigidBodyEntity } from '@/utils/physics.ts'
import { Object3D, Quaternion, Vector3 } from 'three'
import $ from '@/global'
import { getBaseStats } from '@/utils/controller.ts'
import { client } from '@/utils/mpClient.ts'
import Rapier from '@dimforge/rapier3d-compat'

interface RemoteBaseControllerProps {
  id?: string
  modelPath: string
  startPosition: Vector3
  startRotation: Quaternion
  modelHeight: number
  stats?: any
  guild: Guild
  levelType?: LevelType
  animationNamesList: ANIM[]
}

const RemoteBaseController = ({
  id,
  modelPath,
  startPosition,
  modelHeight,
  stats = {},
  guild,
  animationNamesList,
}: RemoteBaseControllerProps) => {
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

  entity.isMoving = true /* to not execute state transition keyboard logic */

  const updatePosition = (deltaS: number) => {
    const remoteActor = client.findActor(entity.userId)
    const remoteData = remoteActor?.getCustomProperties?.() || {}

    /* receive position data from client actor */
    if (!remoteData.rotation) return

    if (remoteData.hasFled) {
      entity.cleanup()
      client.myActor().setCustomProperties({
        hp: undefined,
        rotation: undefined,
        movementVector: undefined,
        meshPos: undefined,
        center: undefined,
        currentVelocity: undefined,
      })
      return
    }

    const damage = entity.hp - remoteData.hp
    entity.dealDamage(entity, damage)

    entity.currency = remoteData.currency
    entity.currentVelocity = new Vector3().copy(remoteData.currentVelocity)
    entity.setRotation(
      new Quaternion(remoteData.rotation.x, remoteData.rotation.y, remoteData.rotation.z, remoteData.rotation.w)
    )
    // entity.rigidBody.setNextKinematicRotation(
    //   new Quaternion(remoteData.rotation.x, remoteData.rotation.y, remoteData.rotation.z, remoteData.rotation.w)
    // )
    entity.rigidBody.setNextKinematicTranslation(
      new Rapier.Vector3(remoteData.movementVector.x, remoteData.movementVector.y, remoteData.movementVector.z)
    )

    const meshPos = new Vector3().copy(remoteData.meshPos)

    entity.position.copy(meshPos)
    mesh.position.copy(meshPos)
    entity.center = new Vector3().copy(remoteData.center)
    if (remoteData.currentState !== entity.stateMachine.currentState) {
      entity.stateMachine.setState(remoteData.currentState)
      remoteActor.setCustomProperties({
        currentState: undefined,
      })
    }
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

export default RemoteBaseController
