import 'dotenv/config'

const toBool = (text: string | undefined | null, defaultValue: boolean): boolean => {
    if (null === text || undefined === text) {
      return defaultValue
    }
    if ('true' === text || '1' === text) {
        return true
    }
    if ('false' === text || '0' === text) {
        return false
    }

    return defaultValue
}

const sslEnabled = toBool(process.env.SSL_ENABLED, false)

enum Schema {
    HTTP = 'http',
    HTTPS = 'https'
}

const config: Global.Config = {
    global: {
        environment: process.env.NODE_ENV || 'production'
    },
    redis: {
        enabled: toBool(process.env.USE_REDIS, false),
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    server: {
        host: process.env.SERVER_HOSTNAME || 'localhost',
        web: {
            ssl: sslEnabled,
            schema: sslEnabled ? Schema.HTTPS : Schema.HTTP,
            bind: process.env.WEB_SERVER_BIND_ADDRESS || '0.0.0.0',
            port: parseInt(process.env.WEB_SERVER_BIND_PORT || '80')
        },
        socket: {
            schema: 'ws',
            bind: process.env.SOCKET_SERVER_BIND_ADDRESS || '0.0.0.0',
            port: parseInt(process.env.SOCKET_SERVER_BIND_PORT || '3000')
        }
    },
    cors: {
        whitelist: [
            'https://127.0.0.1',
            'https://example2.com',
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
        exposedHeaders: []
    }
}

export default config
