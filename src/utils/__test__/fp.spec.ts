import { createPipeLine, when } from '../fp'

describe('utils/fp test', () => {
  test('break pipeLine', () => {
    const plus = () => (o: number) => {
      return o + 1
    }

    const multiply = () => (o: number) => {
      return o * 10
    }

    let { pipeLine, breakPipe } = createPipeLine()

    let num = pipeLine(
      plus(),
      plus(),
      when(() => true, multiply(), breakPipe),
      plus(),
      plus()
    )(0)

    expect(num).toEqual(20)
  })
})
