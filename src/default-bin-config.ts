const defaultBinConfig: RequestCatcher.BinConfig = {
  response: {
    status_code: 200,
    headers: [
      {
        name: 'User-Agent',
        value: 'Request catcher 1.0.0'
      }
    ],
    body: ''
  },
  service: {
    delay: 0,
    ttl: 0
  }
}

export default defaultBinConfig
