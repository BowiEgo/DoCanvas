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

export const pipe = function (funcs) {
  let len = funcs.length
  let index = 0
  let result
  return function f1(...args) {
    // 第一次args是传进来的参数，之后args==result
    result = funcs[index].apply(this, args)
    if (index >= len - 1) {
      // 重置下标为0
      index = 0
      return result
    }
    index++
    return f1.call(null, result)
  }
}
// compose的实现
export const compose = function (args) {
  return pipe(args.reverse())
}
