export interface LoggerOptions {
  id: string
  enabled: boolean
}

export interface Logger {
  id: string
  enabled: boolean
  start: number
  debug(this: Logger, ...args: unknown[]): void
  getTime(): number
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

export function createLogger({ id, enabled }: LoggerOptions): Logger {
  // let instances: { [key: string]: Logger } = {}
  let logger: Logger = {
    id,
    enabled,
    start: Date.now(),
    debug,
    getTime,
    info,
    warn,
    error
  }

  return logger
}

function debug(this: Logger, ...args: unknown[]): void {
  if (this.enabled) {
    // eslint-disable-next-line no-console
    if (
      typeof window !== 'undefined' &&
      window.console &&
      typeof console.debug === 'function'
    ) {
      // eslint-disable-next-line no-console
      console.debug(this.id, `${this.getTime()}ms`, ...args)
    } else {
      this.info(...args)
    }
  }
}

function getTime(): number {
  return Date.now() - this.start
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function info(...args: unknown[]): void {
  if (this.enabled) {
    // eslint-disable-next-line no-console
    if (
      typeof window !== 'undefined' &&
      window.console &&
      typeof console.info === 'function'
    ) {
      // eslint-disable-next-line no-console
      console.info(this.id, `${this.getTime()}ms`, ...args)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function warn(...args: unknown[]): void {
  if (this.enabled) {
    // eslint-disable-next-line no-console
    if (
      typeof window !== 'undefined' &&
      window.console &&
      typeof console.warn === 'function'
    ) {
      // eslint-disable-next-line no-console
      console.warn(this.id, `${this.getTime()}ms`, ...args)
    } else {
      this.info(...args)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function error(...args: unknown[]): void {
  if (this.enabled) {
    // eslint-disable-next-line no-console
    if (
      typeof window !== 'undefined' &&
      window.console &&
      typeof console.error === 'function'
    ) {
      // eslint-disable-next-line no-console
      console.error(this.id, `${this.getTime()}ms`, ...args)
    } else {
      this.info(...args)
    }
  }
}
