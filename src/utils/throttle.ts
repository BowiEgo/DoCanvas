export function getThrottle(threshold: number) {
  let timer
  return function (fn) {
    if (!timer) {
      timer = setTimeout(function () {
        fn()
        timer = null
      }, threshold)
    }
  }
}
