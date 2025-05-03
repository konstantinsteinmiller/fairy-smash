import CollidableItem from '@/entity/power-ups/CollidableItem.ts'
import { Vector3 } from 'three'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import type { Guild } from '@/types/entity.ts'
import $ from '@/global'
import useUser from '@/use/useUser.ts'

interface CollidableItemProps {
  position: Vector3
  onlyInteractableByGuild?: Guild
  fixed?: boolean
}
export default ({ position, onlyInteractableByGuild, fixed }: CollidableItemProps) => {
  const { userSoundVolume } = useUser()

  const collidable: any = CollidableItem({
    name: 'small power up box',
    collidableId: 'small-power-up-box',
    meshPath: '/models/items/power-ups/power-up.comp.glb',
    hp: 20,
    size: 0.2,
    onCollisionStart: (collider, otherCollider, uuid, entity: any, data?: { isVfx?: boolean; damage?: number }) => {
      /* on collide buff logic */
      console.log('colliderA: ', collider, otherCollider, entity)
      if (entity && data?.isVfx && collider) {
        $.sounds.addAndPlayPositionalSound(entity, 'hitBox', {
          volume: userSoundVolume.value * 0.3,
        })
        entity.dealDamage(collider, data.damage)

        console.log('something hit box: ', collider.hp, data?.damage)
        if (entity.isDead(collider)) {
          console.log('--box died--')
          /* this is a pickup item, so we remove it here, we might have other logic here later */
          cleanup()
        }
      }
    },
    onCollisionEnd: () => {},
    onCleanup: () => {},
    colliderType: 'fixed',
    colliderBoxSize: 0.3,
    position,
    onlyInteractableByGuild,
    rotateMesh: false,
  })

  let cleanup = () => {}
  if (fixed) {
    cleanup = () => {
      collidable.emitter.emit('cleanup')
    }
    setTimeout(() => {
      collidable.addToLevel($.level)
    }, 50)
    return collidable
  }

  // Create a Rapier rigid body and collider
  const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(position.x, position.y, position.z)
  rigidBodyDesc
    .setCcdEnabled(true)
    .setLinearDamping(0.95) // Air resistance
    .setAngularDamping(0.9) // Rotational resistance
  collidable.rigidBody = $.physics.createRigidBody(rigidBodyDesc)

  // Create collider with friction
  const colliderDesc = ColliderDesc.ball(0.2).setRestitution(0.5) // Bounciness

  $.physics.createCollider(colliderDesc, collidable.rigidBody)

  // Sync the sprite and VFX position with the rigid body
  const updatePosition = () => {
    if (!collidable?.rigidBody.isValid()) return
    const rigidBodyPosition = collidable.rigidBody.translation()
    const newPosition = new Vector3(rigidBodyPosition.x, rigidBodyPosition.y, rigidBodyPosition.z)
    collidable.position.copy(newPosition)
  }

  // Add the update function to the render loop
  const updateUuid = $.addEvent('renderer.update', updatePosition)

  cleanup = () => {
    $.removeEvent('renderer.update', updateUuid)
    $.physics?.removeRigidBody(collidable?.rigidBody)
    collidable.emitter.emit('cleanup')
  }

  setTimeout(() => {
    collidable.addToLevel($.level)
  }, 50)

  return collidable
}
