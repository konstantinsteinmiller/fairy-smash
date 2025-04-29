import { ref } from 'vue'

const AppId = import.meta.env.VITE_APP_ID
const AppVersion = import.meta.env.VITE_APP_VERSION
// import $ from '@/global'

const DemoConstants = {
  /// <summary>(1) Event defining a color of a player.</summary>
  EvColor: 1,

  /// <summary>(2) Event defining the position of a player.</summary>
  EvPosition: 2,

  /// <summary>("s") Property grid size currently used in this room.</summary>
  GridSizeProp: 's',

  /// <summary>("m") Property map (map / level / scene) currently used in this room.</summary>
  MapProp: 'm',

  /// <summary>Types available as map / level / scene.</summary>
  MapType: { Forest: 'Forest', Town: 'Town', Sea: 'Sea' },

  GroupsPerAxis: 2,

  GridSizeDefault: 16,
  GridSizeMin: 4,
  GridSizeMax: 256,

  TickInterval: 500,

  LogLevel: Photon.LogLevel.INFO,
}

const selectedRoomId = ref(-1)

const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Ws, AppId, AppVersion)
export const room = new Photon.LoadBalancing.Room('test-room')
room.setCustomProperty(DemoConstants.MapProp, DemoConstants.MapType.Forest)
room.setCustomProperty(DemoConstants.GridSizeProp, DemoConstants.GridSizeDefault)
room.setPropsListedInLobby([DemoConstants.MapProp])
room.setRoomTTL(10000)
room.setPlayerTTL(10000)
// const actor = new Photon.LoadBalancing.Actor(name, actorNr, isLocal)
// actor.getRoom() //get room from server

client.autoconnect = true
client.roomFactory = (name: string) => {
  return new ParticleRoom(name)
}
client.actorFactory /* = (name: string, actorNr: number, isLocal: boolean) => {
  return new FairyPlayer(client, name, actorNr, isLocal)
}*/
// client.myRoom
// client.myActor
// client.myRoomActors

client.onStateChange = (state: number) => {
  // "namespace" import for static members shorter acceess
  const LBC = Photon.LoadBalancing.LoadBalancingClient

  console.log('STATE_UPDATE: ', LBC.StateToName(state), ' - joined: ', state == LBC.State.Joined, client.myRoom().name)
  switch (state) {
    case LBC.State.ConnectedToNameServer:
      client.getRegions()
      client.connectToRegionMaster('EU')
      break
    case LBC.State.ConnectedToMaster:
      // this.webRpc("GetGameList");
      break
    case LBC.State.JoinedLobby:
      if (client.autoconnect) {
        console.log('joining random room...')
        client.joinRandomRoom()
      }
      break
    default:
      break
  }
}
client.start = () => {
  console.log('started client: ')
}
client.init = () => {
  const addr = client.getMasterServerAddress()

  client.setLogLevel(DemoConstants.LogLevel)
  client.myActor().setName('AwesomePlayer' + Math.floor(Math.random() * 100))
  // client.raiseEvent()
  client.connect({ keepMasterConnection: true })

  console.log('init client: ')
}
// client.connect({ keepMasterConnection: true })
client.onError = (errorCode: number, errorMsg: string) => {
  console.log('Error: ', errorCode, errorMsg)
}
client.onLobbyStats = (errorCode: number, errorMsg: string, lobbies: any) => {
  console.log('onLobbyStats', errorCode, errorMsg, lobbies)
}
client.createNewRoom = (name: string) => {
  console.log('creating New Game: ', name)
  console.log('client.isInLobby(): ', client.isInLobby())
  client.createRoomFromMy()
}
client.startGame = () => {
  if (client.isInLobby()) {
    client.createRoom()
  } else {
    console.log('Reload page to connect to Master')
  }
  return false
}

client.onOperationResponse = (errorCode: number, errorMsg: string, code: number, content: any) => {
  if (errorCode) {
    switch (code) {
      case Photon.LoadBalancing.Constants.OperationCode.JoinRandomGame:
        switch (errorCode) {
          case Photon.LoadBalancing.Constants.ErrorCode.NoRandomMatchFound:
            console.log('Join Random:', errorMsg)
            client.createRoom()
            break
          default:
            console.log('Join Random:', errorMsg)
            break
        }
        break
      default:
        console.log('Operation Response error:', errorCode, errorMsg, code, content)
        break
    }
  }
}

/* receiving raiseEvents from other players */
client.onEvent = (code: number, content: any, actorNr: number) => {
  let p = null
  switch (code) {
    case DemoConstants.EvColor:
      // var color = content[1]
      p = client.myRoomActors()[actorNr]
      console.log('p: ', p)
      break
    case DemoConstants.EvPosition:
      p = client.myRoomActors()[actorNr]
      console.log('p: ', p)
      // p.move(content[1][0], content[1][1])
      console.log('Actor', actorNr, 'Pos:', content[1][0], content[1][1])
      break

    default:
  }
  console.log('onEvent', code, 'content:', content, 'actor:', actorNr)
}
// client.isInLobby()
// client.suspendRoom() // for later rejoin -> go to Master Server
// client.leaveRoom()
client.onJoinRoom = () => {
  console.log('onJoinRoom myRoom', client.myRoom())
  console.log('onJoinRoom myActor', client.myActor())
  console.log('onJoinRoom myRoomActors', client.myRoomActors())
}

client.joinGame /*Existing*/ = (ev: any) => {
  if (client.isInLobby()) {
    if (selectedRoomId.value >= 0 && selectedRoomId.value < client.availableRooms().length) {
      const gameId = client.availableRooms()[selectedRoomId.value].name
      console.log('Join existing Game', gameId)
      client.joinRoom(gameId, {
        /* rejoin: (<HTMLInputElement>document.getElementById('rejoin')).checked*/
      })
    } else {
      console.log('No Rooms to Join')
    }
  } else {
    console.log('Reload page to connect to Master')
  }
  return false
}
client.onRoomList = (rooms: Photon.LoadBalancing.RoomInfo[]) => {
  console.log('rooms: ', rooms)
  // client.updateRoomListMenu(rooms)
}
client.onMyRoomPropertiesChange = (data: any) => {
  console.log('onMyRoomPropertiesChange data: ', data)
}
client.onPropertiesChange = (changedCustomProps: any) => {
  // optional: check if size prop in changedCustomProps
  // client.getCustomPropertyOrElse(DemoConstants.GridSizeProp, client._gridSize)
}
client.onActorJoin = (actor: Photon.LoadBalancing.Actor) => {
  console.log('actor ' + actor.actorNr + ' joined')
}
client.onActorLeave = (actor: Photon.LoadBalancing.Actor) => {
  // const p = <FairyPlayer>actor
  // if (!p.isLocal) {}
  console.log('actor ' + actor.actorNr + ' left')
}

// export default client

class ParticleDemo extends Photon.LoadBalancing.LoadBalancingClient {
  private timerToken: number

  start() {
    this.setupUI()

    this.setupScene()

    this.timerToken = setInterval(() => {
      //            if (this.isJoinedToRoom()) {
      this.tick()
      //            }
    }, DemoConstants.TickInterval)
  }
  stop() {
    clearTimeout(this.timerToken)
  }
  tick() {
    for (const a in this.myRoomActors()) {
      // comment to freeze all
      this.myRoomActors()[a].tick()
    }
  }

  onRoomListUpdate(
    rooms: Photon.LoadBalancing.RoomInfo[],
    roomsUpdated: Photon.LoadBalancing.RoomInfo[],
    roomsAdded: Photon.LoadBalancing.RoomInfo[],
    roomsRemoved: Photon.LoadBalancing.RoomInfo[]
  ) {
    console.log('onRoomListUpdate', rooms, roomsUpdated, roomsAdded, roomsRemoved)
    // this.updateRoomListMenu(rooms)
  }

  // nextGridSize() {
  //   let s = this.myRoom().gridSize()
  //   s = s << 1
  //   if (s > DemoConstants.GridSizeMax) {
  //     s = DemoConstants.GridSizeMin
  //   }
  //   Output.log('nextGridSize:', this.myRoom().gridSize() + ' -> ' + s)
  //   this.myRoom().setCustomProperty(DemoConstants.GridSizeProp, s)
  // }
}

class ParticleRoom extends Photon.LoadBalancing.Room {
  constructor(name: string) {
    super(name)
    this.setCustomProperty(DemoConstants.MapProp, DemoConstants.MapType.Forest)
    this.setCustomProperty(DemoConstants.GridSizeProp, DemoConstants.GridSizeDefault)
    this.setPropsListedInLobby([DemoConstants.MapProp])
    this.setRoomTTL(10000)
    this.setPlayerTTL(10000)
    console.log('ParticleRoom: ')
  }

  // // acceess properties every time
  // public mapType() {
  //   return this.getCustomPropertyOrElse(DemoConstants.MapProp, DemoConstants.MapType.Forest)
  // }
  //
  // public setGridSize(value: number) {
  //   this.setCustomProperty(DemoConstants.GridSizeProp, value)
  // }
}

// class FairyPlayer extends Photon.LoadBalancing.Actor {
//   constructor(
//     private game: ParticleDemo,
//     name: string,
//     actorNr: number,
//     isLocal: boolean
//   ) {
//     super(name, actorNr, isLocal)
//   }
//   public getRoom() {
//     return <ParticleRoom>super.getRoom()
//   }
//   moveLocal(x: number, y: number) {
//     const newGroup = this.getGroupByPos()
//     this.raiseEvent(
//       DemoConstants.EvPosition,
//       { 1: [this.x, this.y] },
//       { interestGroup: this.game.useGroups ? this.group() : undefined }
//     )
//
//     this.move(x, y)
//   }
//   raiseColorEvent() {
//     this.raiseEvent(
//       DemoConstants.EvColor,
//       { 1: this.color },
//       { cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCache }
//     )
//   }
//   private lastUpdateTime = Date.now()
// }

// export const initPhoton = () => {
//   Photon.setOnLoad(() => {
//     // console.log('Photon: ', Photon)
//     // const canvas: any = document.querySelector('canvas')
//     window.onload = () => client.init()
//   })
// }
