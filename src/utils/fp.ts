type AnyFunc = (...arg: any) => any

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

export const pipeWithBreak = () => {
  let breakFlag = false

  return {
    breakFlag,
    pipe:
      <T>(...fns: Array<(arg: T) => T>) =>
      (x: T) => {
        return fns.reduce((y, f) => (breakFlag ? x : f(y)), x)
      },
    breakPipe: () => {
      breakFlag = true
    }
  }
}

export const compose = (args) => pipe(args.reverse())
