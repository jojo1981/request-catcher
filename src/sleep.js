export const sleep = {
  msleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}