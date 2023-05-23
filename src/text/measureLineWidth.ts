export function measureLineWidth(
  ctx,
  start,
  length,
  content,
  w,
  perW,
  letterSpacing
): any {
  if (start >= length) {
    // 特殊情况不应该走进这里
    return [0, 0, false]
  }
  let i = start,
    j = length,
    rw = 0,
    newLine = false
  // 特殊降级，有letterSpacing时，canvas无法完全兼容，只能采取单字测量的方式完成
  if (letterSpacing) {
    let count = 0
    for (; i < length; i++) {
      let mw = ctx.measureText(content.charAt(i)).width + letterSpacing
      if (i > start && count + mw > w + 1e-10) {
        newLine = true
        break
      }
      count += mw
    }
    return [i - start, count, newLine || count > w + 1e-10]
  }
  // 没有letterSpacing可以完美获取TextMetrics
  let hypotheticalNum = Math.round(w / perW)
  // 不能增长0个字符，至少也要1个
  if (hypotheticalNum <= 0) {
    hypotheticalNum = 1
  }
  // 超过内容长度范围也不行
  else if (hypotheticalNum > length - start) {
    hypotheticalNum = length - start
  }
  // 类似2分的一个循环
  while (i < j) {
    let mw,
      str = content.slice(start, start + hypotheticalNum)
    mw = ctx.measureText(str).width
    if (letterSpacing) {
      mw += hypotheticalNum * letterSpacing
    }
    if (mw === w) {
      rw = w
      newLine = true
      break
    }
    // 超出，设置右边界，并根据余量推测减少个数，精度问题，固定宽度或者累加的剩余空间，不用相等判断，而是为原本w宽度加一点点冗余1e-10
    if (mw > w + 1e-10) {
      newLine = true
      // 限制至少1个
      if (i === start && hypotheticalNum === 1) {
        rw = mw
        break
      }
      // 注意特殊判断i和j就差1个可直接得出结果，因为现在超了而-1不超肯定是-1的结果
      if (i === j - 1 || i - start === hypotheticalNum - 1) {
        hypotheticalNum = i - start
        break
      }
      j = hypotheticalNum - 1
      let reduce = Math.round((mw - w) / perW)
      if (reduce <= 0) {
        reduce = 1
      }
      hypotheticalNum -= reduce
      if (hypotheticalNum < i - start) {
        hypotheticalNum = i - start
      }
    }
    // 还有空余，设置左边界，并根据余量推测增加的个数
    else {
      rw = mw
      if (hypotheticalNum === length - start) {
        break
      }
      i = hypotheticalNum + start
      let add = Math.round((w - mw) / perW)
      if (add <= 0) {
        add = 1
      }
      hypotheticalNum += add
      if (hypotheticalNum > j - start) {
        hypotheticalNum = j - start
      }
    }
  }
  return { hypotheticalNum, rw, newLine }
}
