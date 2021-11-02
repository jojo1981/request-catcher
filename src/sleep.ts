export const sleep = {
  msleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
