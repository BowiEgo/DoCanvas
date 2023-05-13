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
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x)

export const compose = (f, g) => {
  return function (x) {
    return f(g(x))
  }
}
