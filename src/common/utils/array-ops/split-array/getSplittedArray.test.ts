import { getSplittedArray } from './getSplittedArray';

describe('Тестирование способов разбить массив (создание объекта)', () => {
  test('case 1: Разбиение массива', () => {
    const originalArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // console.time('arr:create obj')
    const tested = getSplittedArray({
      list: originalArr,
      pageLimit: 3,
    });
    const expected = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10]
    ];
    // console.timeEnd('arr:create obj')

    expect(tested).toEqual(expected);
  })
})
