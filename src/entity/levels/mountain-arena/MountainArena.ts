import FleeOrb from '@/entity/levels/FleeOrb.ts'
import AttackPowerUp from '@/entity/power-ups/AttackPowerUp'
import DefensePowerUp from '@/entity/power-ups/DefensePowerUp'
import $ from '@/global'
import { orientationPosition } from '@/entity/levels/mountain-arena/config'
import AssetLoader, { assetManager, loadNavMesh } from '@/engine/AssetLoader'
import { Object3D, Vector3 } from 'three'
import { createCollidersForGraph } from '@/utils/physics'
import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
import type { SpawnPoint } from '@/types/world.ts'
import FairyDust from '@/entity/FairyDust.ts'
import Heal from '@/entity/power-ups/Heal.ts'
import SmallBox from '@/entity/power-ups/SmallBox.ts'

export default async (onFinishedCallback: () => void) => {
  const mountainArena: any = new Object3D()
  const { loadMesh } = AssetLoader()
  await loadMesh('/worlds/arenas/mountain-arena.comp.glb', mountainArena, 1)

  mountainArena.spawnPointMap = assetManager.assets?.spawnPointMap

  const pathfinder: any = new Pathfinding()
  pathfinder.orientationPosition = orientationPosition
  pathfinder.startPositions = Array.from(mountainArena.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('player' as SpawnPoint)
    })
    .map((sp: any) => sp[1])
  pathfinder.pathfindingHelper = new PathfindingHelper()

  loadNavMesh('/worlds/arenas/mountain-arena-navmesh.fbx', (navMesh: any) => {
    const geo = navMesh?.clone()?.geometry.clone()
    geo.rotateX(-Math.PI / 2)

    // $.scene.add(navMesh)
    mountainArena.zone = 'mountain-arena'
    pathfinder.setZoneData(mountainArena.zone, Pathfinding.createZone(geo))
    mountainArena.children.forEach((child: any) => {
      child.entityType = 'level'
      child.isBattleProtected = true
    })
    mountainArena.isBattleProtected = true

    $.scene.add(pathfinder.pathfindingHelper)
  })

  /* add flee point */
  const fleePoint = new Vector3(0, 28, 0)
  FleeOrb(fleePoint)

  createCollidersForGraph(mountainArena, 'fixed', undefined, 0 /*Math.PI / 2*/)
  mountainArena.name = 'MountainArenaContainer'
  mountainArena.pathfinder = pathfinder
  mountainArena.movingEntitiesList = []
  mountainArena.objects = []

  const powerUpList: any[] = [DefensePowerUp, AttackPowerUp]
  const buffSpawnPointsList = Array.from(mountainArena.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('buff' as SpawnPoint)
    })
    .map((sp: any) => sp[1]?.position)

  buffSpawnPointsList.forEach((spPos: any) => {
    const randomInt: number = Math.random() < 0.5 ? 0 : 1
    const position = new Vector3().copy(spPos).add(new Vector3(0, 0.5, 0))
    const powerUp = powerUpList[randomInt](position)
    powerUp.addToLevel(mountainArena)
  })

  const powerUpSpawnPointsList = Array.from(mountainArena.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('power' as SpawnPoint)
    })
    .map((sp: any) => sp[1]?.position)

  powerUpSpawnPointsList.forEach((spPos: any) => {
    /* generate power ups - permanent damage booster */
    const position = new Vector3().copy(spPos).add(new Vector3(0, 0.5, 0))
    const powerUp = SmallBox({
      position,
    })
    powerUp.addToLevel(mountainArena)
  })

  const healSpawnPointsList = Array.from(mountainArena.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('heal' as SpawnPoint)
    })
    .map((sp: any) => sp[1]?.position)

  healSpawnPointsList.forEach((spPos: any) => {
    const position = new Vector3().copy(spPos).add(new Vector3(0, 0.5, 0))
    const powerUp = Heal(position)
    powerUp.addToLevel(mountainArena)
  })

  const fairyDustSpawnPointsList = Array.from(mountainArena.spawnPointMap)
    ?.filter((sp: any) => {
      return sp[1]?.type === ('dust' as SpawnPoint)
    })
    .map((sp: any) => sp[1]?.position)

  fairyDustSpawnPointsList.forEach((spPos: any, index) => {
    if (index % 2 === 1) return
    FairyDust({ position: new Vector3().copy(spPos), fixed: true })
  })

  $.scene.add(mountainArena)
  $.level = mountainArena

  onFinishedCallback()

  return mountainArena
}
