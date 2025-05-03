import CollidableItem from '@/entity/power-ups/CollidableItem.ts'
import { Vector3 } from 'three'
import type { Guild } from '@/types/entity.ts'
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
    onCollisionStart: (collider, otherCollider, uuid, entity: any) => {
      /* on collide buff logic */
      console.log('something hit box: ', collider, otherCollider, entity)
      entity.currency.powerUp += 1
      entity.currentSpell.powerUp.value += 0.1
      collidable.emitter.emit('cleanup')
    },
    onCollisionEnd: () => {},
    onCleanup: () => {},
    colliderType: 'fixed',
    colliderBoxSize: 0.3,
    collisionSound: {
      name: 'hitBox',
      options: {
        volume: userSoundVolume.value * 0.3,
      },
    },
    position,
    onlyInteractableByGuild,
    rotateMesh: false,
  })

  return collidable
}
