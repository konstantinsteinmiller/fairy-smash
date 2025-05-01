import { client } from '@/utils/mpClient.ts'

export default class FiniteStateMachine {
  statesMap: { [key: string]: any }
  currentState: any

  constructor() {
    this.statesMap = {}
    this.currentState = null
  }

  addState(name: string, state: any) {
    this.statesMap[name] = state
  }

  setState(stateName: string) {
    if (this.owner.userId === client.myActor().userId) {
      client.myActor()?.setCustomProperties({ currentState: stateName })
    }
    const previousState = this.currentState

    if (previousState) {
      if (previousState.Name == stateName) {
        return
      }
      previousState?.exit()
    }

    const nextState = new this.statesMap[stateName](this)

    this.currentState = nextState
    nextState?.enter(previousState)
  }

  update(timeElapsedInMs: number, input: any) {
    this?.currentState?.update(timeElapsedInMs, input)
  }

  enter() {}
  exit() {}
}
