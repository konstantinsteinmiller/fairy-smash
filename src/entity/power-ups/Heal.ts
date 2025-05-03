import CollidableItem from '@/entity/power-ups/CollidableItem.ts'
import { startShimmeringSphere } from '@/vfx/shimmering-sphere.ts'
import { Vector3 } from 'three'
import { client } from '@/utils/mpClient.ts'

export default (position: Vector3) => {
  const vfx = startShimmeringSphere({
    position,
    colors: [
      0xff1200, // Bright gold
      0xda1200, // Goldenrod
      0xb8120b, // Dark goldenrod
    ],
    radius: 0.6,
  })

  const collidable: any = CollidableItem({
    name: 'heal',
    meshPath: '/models/items/power-ups/heal.comp.glb',
    size: 0.2,
    onCollisionStart: (colliderA, colliderB, uuid, entity) => {
      if (entity) {
        entity.dealDamage(entity, -30)
        const hitTargetActor = client.findActor(entity.userId)
        hitTargetActor?.setCustomProperties({
          hp: entity.hp,
        })
      }

      /* this is a pickup item, so we remove it here, we might have other logic here later */
      collidable.emitter.emit('cleanup')
      vfx.emit('cleanup')
    },
    onCollisionEnd: () => {},
    onCleanup: () => {},
    collisionSound: {
      name: 'heal',
      options: { volume: 1.2 * 0.25 },
    },
    position,
    rotateMesh: true,
  })

  return collidable
}
