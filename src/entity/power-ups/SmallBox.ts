import CollidableItem from '@/entity/power-ups/CollidableItem.ts'
import { Vector3 } from 'three'

export default (position: Vector3) => {
  const collidable: any = CollidableItem({
    name: 'small power up box',
    meshPath: '/models/items/power-ups/power-up.comp.glb',
    size: 0.2,
    onCollisionStart: (colliderA, colliderB, uuid, entity) => {
      /* on collide buff logic */
      console.log('colliderA: ', colliderA, colliderB, entity)
      if (entity) {
        console.log('something hit box: ')
      }

      /* this is a pickup item, so we remove it here, we might have other logic here later */
      collidable.emitter.emit('cleanup')
    },
    onCollisionEnd: () => {},
    onCleanup: () => {},
    collisionSound: {
      name: 'hitBox',
      options: { volume: 1.2 * 0.25 },
    },
    position,
    rotateMesh: true,
  })

  return collidable
}
