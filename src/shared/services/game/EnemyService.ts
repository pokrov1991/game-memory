import { EnemyState } from "./types";

export type EnemyStateChangeCallback = (state: EnemyState) => void;

export class EnemyService {
  state: EnemyState = EnemyState.DEFAULT
  private queue: { state: EnemyState; duration: number }[] = []
  private isProcessing = false
  private onStateChange: EnemyStateChangeCallback
  private durations: Record<EnemyState, number>

  constructor(durations: Record<EnemyState, number>, onStateChange: EnemyStateChangeCallback) {
    this.durations = durations
    this.onStateChange = onStateChange
  }

  enqueue(state: EnemyState, duration: number) {
    this.queue.push({ state, duration })
    this.processQueue()
  }

  private processQueue() {    
    if (this.isProcessing || this.queue.length === 0) return
    this.isProcessing = true

    const { state, duration } = this.queue.shift()
    this.state = state    
    this.onStateChange(state)

    setTimeout(() => {
      this.isProcessing = false
      this.processQueue()
    }, duration)
  }

  setStartState() {
    this.enqueue(EnemyState.START, this.durations.START)
    this.setRunState()
  }
  setRunState() {
    this.enqueue(EnemyState.RUN, this.durations.RUN)
  }
  setAttackState() {
    this.enqueue(EnemyState.ATTACK, this.durations.ATTACK)
    this.resetState()
  }
  resetState() {
    this.enqueue(EnemyState.DEFAULT, this.durations.DEFAULT)
  }
}