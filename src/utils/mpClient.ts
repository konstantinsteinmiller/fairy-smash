import { EventEmitter } from 'events'
import { MP_EVENTS } from '@/utils/enums.ts'
import Actor = Photon.LoadBalancing.Actor

const AppId = import.meta.env.VITE_APP_ID
const AppVersion = import.meta.env.VITE_APP_VERSION
const NODE_ENV = process.env.NODE_ENV

const LBC = Photon.LoadBalancing.LoadBalancingClient

class SimplePhotonClient extends Photon.LoadBalancing.LoadBalancingClient {
  private _onRoomListUpdateCallback: (rooms: Photon.LoadBalancing.RoomInfo[]) => void = () => {}
  private _availableRooms: Photon.LoadBalancing.RoomInfo[] = []
  emitter = new EventEmitter()

  constructor() {
    const protocol: number = NODE_ENV === 'production' ? Photon.ConnectionProtocol.Wss : Photon.ConnectionProtocol.Ws
    super(protocol, AppId, AppVersion)
    this.setLogLevel(Photon.LogLevel.INFO)
  }

  // public get actors() {
  //   return this.myRoom()?.loadBalancingClient.actorsArray
  // }

  public connectToMaster(): void {
    this.connectToRegionMaster('EU') // Or your desired region
  }

  public onConnectedToMaster(): void {
    console.log('Connected to Master Server')
    // this.joinLobby()
  }

  public onServerErrorInfo(info: string): void {
    console.error('info: ', info)
  }

  public onJoinedLobby(): void {
    console.log('Joined Lobby')
    // You are now automatically in the lobby
  }

  public joinGame(roomName: string): void {
    if (this.state() === LBC.State.JoinedLobby) {
      console.log(`Joining room: ${roomName}`)
      this.joinRoom(roomName)
    } else {
      console.warn('Not joined to the lobby yet.')
    }
  }

  public onJoinRoom(): void {
    // console.log(`Successfully joined room: ${this.myRoom().name}`)
    this.emit('joinedRoom', this.myRoom().name)
  }

  public onJoinRoomFailed(errorCode: number, errorMsg: string): void {
    console.error(`Failed to join room: ${errorMsg} (Error Code: ${errorCode})`)
  }

  public showAvailableRooms(callback: (rooms: Photon.LoadBalancing.RoomInfo[]) => void): void {
    this._onRoomListUpdateCallback = callback
    if (this.state() === LBC.State.JoinedLobby) {
      this._onRoomListUpdateCallback(this._availableRooms)
    } else {
      console.warn('Not joined to the lobby yet. Room list will be updated upon joining.')
    }
  }

  public onRoomListUpdate(
    rooms: Photon.LoadBalancing.RoomInfo[],
    roomsUpdated: Photon.LoadBalancing.RoomInfo[],
    roomsAdded: Photon.LoadBalancing.RoomInfo[],
    roomsRemoved: Photon.LoadBalancing.RoomInfo[]
  ): void {
    this._availableRooms = rooms
    this._onRoomListUpdateCallback(this._availableRooms)
  }

  public onRoomList(rooms: Photon.LoadBalancing.RoomInfo[]): void {
    this._availableRooms = rooms
    this._onRoomListUpdateCallback(this._availableRooms)
  }

  public onError(errorCode: number, errorMsg: string): void {
    console.error(`Photon Error: ${errorMsg} (Error Code: ${errorCode})`)
  }

  public onActorLeave(actor: Actor, cleanup: boolean): void {
    // console.log(`onActorLeave: ${actor} (cleanup: ${cleanup})`)
    this.emit('playerLeft', { actor })
  }

  public onEvent(code: number, data: any, actorNr: number): void {
    const eventEntry = Object.entries(MP_EVENTS).find(entry => entry[1] === code)
    let eventEntryName = 'no code found'
    if (eventEntry !== null && eventEntry !== undefined) {
      eventEntryName = eventEntry[0]
    }
    this.emit(eventEntryName, { data, actorNr, userId: this.getUserId() })
  }

  public onActorJoin(actor: any): void {
    this.emit('playerJoined', { actor })
  }

  public isMyActor(actor: any): boolean {
    return actor.actorNr === this.myActor().actorNr
  }

  public findActor(actorToFind: string | object): boolean {
    return (
      this.actorsArray?.find((actor: any) => actor.userId === actorToFind || actor.userId === actorToFind?.userId) ||
      null
    )
  }

  public onStateChange(state: number): void {
    const LBC = Photon.LoadBalancing.LoadBalancingClient
    const stateName = LBC.StateToName(state)
    if (state == LBC.State.Joined) {
      // console.log("Photon State:", stateName, `(${state})`);
    }
    if (state == LBC.State.JoinedLobby) {
      this.emit('joinedLobby')
    }
    // ;(state >= 8 || state === 5) && console.log('___ Photon State:', stateName, `(${state})`)
  }

  public onLeaveRoom(): void {
    console.log('onLeaveRoom: ', client, client?.isJoinedToRoom)
    if (client?.isJoinedToRoom()) {
      client.raiseEvent(MP_EVENTS.LEAVE_ROOM, {
        message: `left`,
      })
      client.leaveRoom()
      client?.emitter?.emit('onLeftRoom' /*data*/)
    } else {
      console.warn('Cannot leave room: client not connected or not joined to a room.')
    }
    // client.raiseEvent({Photon.LoadBalancing.Constants.OperationCode})
  }

  public get sortedActors(): Actor[] {
    return this.actorsArray.sort((a: Actor, b: Actor) => {
      if (a.actorNr > b.actorNr) return 1
      if (a.actorNr < b.actorNr) return -1
      if (a.actorNr === b.actorNr) return 0
    })
  }

  public get actorsList(): Actor[] {
    return client.actorsArray
  }
  public get actorsNames(): Actor[] {
    return client.actorsArray.map(actor => actor.name)
  }

  emit(event: string, ...args: any[]): void {
    // Custom event emitter logic can be added here
    this.emitter.emit(event, ...args)
  }
  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener)
  }
  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener)
  }
}

export const client = new SimplePhotonClient()
client.connectToMaster()

// Example of showing available rooms after a delay to ensure connection
// setTimeout(() => {
//   client.showAvailableRooms(rooms => {
//     console.log(
//       'Available Rooms:',
//       rooms.map(r => r.name)
//     )
//     if (rooms.length > 0) {
//       // Optionally join the first room
//       client.joinGame(rooms[0].name)
//     }
//   })
// }, 3000)

// Example of joining a specific room after a delay
// setTimeout(() => {
//   client.joinGame('My New Room') // Replace with the desired room name
// }, 5000)
