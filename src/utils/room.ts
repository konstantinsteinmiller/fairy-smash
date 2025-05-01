import { client } from '@/utils/mpClient.ts'
import $ from '@/global.ts'

export const checkRoomGameOver = (entity: any) => {
  const actor = client.findActor(entity)
  actor?.setCustomProperties({
    isDead: entity?.isDead(entity),
  })

  if (
    client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead || actor.getCustomProperties()?.hasFled)
      .length >=
    client.actorsArray.length - 1
  ) {
    // console.log(
    //   'client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead).length: ',
    //   client.actorsArray.filter(actor => actor.getCustomProperties()?.isDead || actor.getCustomProperties()?.hasFled)
    //     .length
    // )
    // console.log('client.actorsArray.length: ', client.actorsArray.length)

    $.isBattleOver = true
  }
}
