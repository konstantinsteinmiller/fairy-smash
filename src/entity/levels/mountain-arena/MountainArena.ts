// import FairyDust from '@/entity/FairyDust.ts'
import FleeOrb from '@/entity/levels/FleeOrb.ts'
import AttackPowerUp from '@/entity/power-ups/AttackPowerUp'
import DefensePowerUp from '@/entity/power-ups/DefensePowerUp'
import $ from '@/global'
import {
  portalConnectionsList,
  orientationPosition,
  portalTransitionMap,
  coverPositions,
} from '@/entity/levels/mountain-arena/config'
import AssetLoader, { assetManager, loadNavMesh } from '@/engine/AssetLoader'
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three'
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
  pathfinder.portalConnectionsList = portalConnectionsList
  pathfinder.portalTransitionMap = portalTransitionMap
  pathfinder.orientationPosition = orientationPosition
  pathfinder.coverPositions = coverPositions
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

    if ($.enableDebug) {
      const wiredNavMesh = new Mesh(geo, new MeshBasicMaterial({ color: 0x202020, wireframe: true }))
      $.scene.add(wiredNavMesh)
      const wiredFillMesh = new Mesh(
        geo,
        new MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.5,
          transparent: true,
        })
      )
      $.scene.add(wiredFillMesh)
    }
    $.scene.add(pathfinder.pathfindingHelper)
  })

  /* add flee point */
  const fleePoint = new Vector3(0, 28, 0)
  FleeOrb(fleePoint)

  const coverBoxGeometry = new BoxGeometry(0.5, 0.5, 0.5)
  coverBoxGeometry.computeBoundingBox()
  coverBoxGeometry.computeBoundingSphere()

  /*
  Debugging Cover Positions
  coverPositions.forEach((cover: any) => {
    const coverPos = new Vector3(cover.x, cover.y + 0.9, cover.z)

    const coverBoxMaterial = new MeshStandardMaterial({ color: 0xf0df00 })
    const coverBox = new Mesh(coverBoxGeometry, coverBoxMaterial)
    coverBox.position.copy(coverPos)
    coverBox.name = 'cover'
    mountainArena.add(coverBox)
    $.scene.updateMatrixWorld(true)
  })*/

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

  fairyDustSpawnPointsList.forEach((spPos: any) => {
    FairyDust({ position: new Vector3().copy(spPos), fixed: true })
  })

  $.scene.add(mountainArena)
  $.level = mountainArena

  // FairyDust({ position: new Vector3(9.5, -2.1, 7) })
  // FairyDust({ position: new Vector3(8, 5, 2.4) })

  onFinishedCallback()

  return mountainArena
}
