import CollidableItem from '@/entity/power-ups/CollidableItem.ts'
import { createVFX } from '@/utils/vfx.ts'
import $ from '@/global'
import { Vector3 } from 'three'
import { client } from '@/utils/mpClient.ts'

export default async (position: Vector3) => {
  if (!$.canFlee) return

  const name = 'fleeOrb'
  const { emitter: fleeEmitter, nebulaSystem } = await createVFX({
    vfxName: name,
    position,
    removeOnDeath: false,
    options: { depthTest: true },
  })

  const collidable: any = CollidableItem({
    name: name,
    meshPath: '',
    size: 3,
    onCollisionStart: (_colliderA, _colliderB, _uuid, entity) => {
      /* on collide buff logic */
      if (entity && $.canFlee) {
        const actor = client.findActor(entity)
        actor?.setCustomProperties({ hasFled: true })
        entity.cleanup()
      }

      /* this is a pickup item, so we remove it here, we might have other logic here later */
      cleanup()
    },
    colliderType: 'fixed',
    collisionSound: {
      name: 'flee',
      options: { volume: 1.2 * 0.25 },
    },
    position,
    rotateMesh: false,
  })

  const cleanup = () => {
    fleeEmitter.emit('cleanup')
    collidable.emitter.emit('cleanup')
    $.removeEvent('battle.cleanup', cleanupUuid)
  }
  const cleanupUuid = $.addEvent('battle.cleanup', cleanup)

  collidable.addToLevel($.level)
}
