declare namespace Global {

    enum Schema {
        HTTP = 'http',
        HTTPS = 'https'
    }

    interface Config {
        global: {
            environment: string
        }
        redis: {
            enabled: boolean
            host: string
            port: number
        }
        server: {
            host: string
            web: {
                ssl: boolean
                schema: Schema
                bind: string
                port: number
            }
            socket: {
                schema: string
                bind: string
                port: number
            }
        }
        cors: {
            whitelist: string[]
            methods: string[]
            successStatus: number
            allowedHeaders: string[]
            exposedHeaders: string[]
        }
    }

}
