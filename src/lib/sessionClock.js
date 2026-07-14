// Absolute-timestamp clock: elapsed time is always derived from performance.now()
// minus accumulated pause time, never from summing tick counts. This keeps the
// clock immune to setInterval drift/throttling — a throttled tick just delays
// when we notice a threshold was crossed, it never desyncs what "now" actually is.
export class SessionClock {
  constructor() {
    this.startedAt = null;
    this.pausedAccumMs = 0;
    this.pauseStartedAt = null;
  }

  start() {
    this.startedAt = performance.now();
    this.pausedAccumMs = 0;
    this.pauseStartedAt = null;
  }

  pause() {
    if (this.startedAt === null || this.pauseStartedAt !== null) return;
    this.pauseStartedAt = performance.now();
  }

  resume() {
    if (this.pauseStartedAt === null) return;
    this.pausedAccumMs += performance.now() - this.pauseStartedAt;
    this.pauseStartedAt = null;
  }

  get isPaused() {
    return this.pauseStartedAt !== null;
  }

  elapsedMs() {
    if (this.startedAt === null) return 0;
    const liveGap = this.pauseStartedAt !== null ? performance.now() - this.pauseStartedAt : 0;
    return performance.now() - this.startedAt - this.pausedAccumMs - liveGap;
  }

  reset() {
    this.startedAt = null;
    this.pausedAccumMs = 0;
    this.pauseStartedAt = null;
  }
}
