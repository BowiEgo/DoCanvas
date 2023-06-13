export const withConstructor = (constructor) => (o) => {
  const proto = Object.assign({}, Object.getPrototypeOf(o), { constructor })
  return Object.assign(Object.create(proto), o)
}

export const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (x: T): any => {
    return fns.reduce((y, f) => f(y), x)
  }

export const compose = (args) => pipe(args.reverse())

export const createPipeLine = () => {
  let breakFlag = false

  const resetPipeLine = (x: any, fns: Array<Function>, f: Function): any => {
    if (fns.indexOf(f) === fns.length - 1) {
      breakFlag = false
    }
    return x
  }

  return {
    pipeLine:
      <T>(...fns: Array<(arg: T) => T>) =>
      (x: T) => {
        return fns.reduce(
          (y, f) => (breakFlag ? resetPipeLine(y, fns, f) : f(y)),
          x
        )
      },
    breakPipe: (): void => {
      breakFlag = true
    }
  }
}

export const when =
  (cond: Function, f: Function, hook?: Function) => (x: any) =>
    cond()
      ? (() => {
          hook && hook()
          return f(x)
        })()
      : x
