export const getSplittedArray = <T>({ pageLimit, list }: {
  pageLimit: number;
  list: T[];
}): T[][] => {
  const newList = new Array(Math.ceil(list.length / pageLimit))

  for (let i = 0, max = newList.length; i < max; i++) {
    // newList[i] = list.splice(0, pageLimit)
    newList[i] = list.slice(i * pageLimit, (i + 1) * pageLimit)
  }

  return newList
}
