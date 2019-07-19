import 'dotenv/config'

export default {
  global: {
    environment: process.env.NODE_ENV || "production"
  },
  redis: {
    enabled: 'true' === process.env.USE_REDIS|| false,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  },
  server: {
    host: process.env.SERVER_HOSTNAME || 'localhost',
    web: {
      ssl: 'true' === process.env.SSL_ENABLED,
      schema: 'true' === process.env.SSL_ENABLED ? 'https' : 'http',
      bind: process.env.WEB_SERVER_BIND_ADDRESS || '0.0.0.0',
      port: process.env.WEB_SERVER_BIND_PORT || 80
    },
    socket: {
      schema: 'ws',
      bind: process.env.SOCKET_SERVER_BIND_ADDRESS || '0.0.0.0',
      port: process.env.SOCKET_SERVER_BIND_PORT || 3000
    }
  },
  cors: {
    whitelist: [
      'http://127.0.0.1',
      'http://example2.com',
      'https://foo.bar.org'
    ],
    methods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE'
    ],
    successStatus: 204, // use 200 for some legacy browsers (IE11, various SmartTVs) choke on 204
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization'
    ],
    exposedHeaders: [
    ]
  }
}
