declare namespace RequestCatcher {

    type Uuid = string
    type BinId = Uuid

    interface Header {
        name: string
        value: string
    }

    interface Request {
        id: number
        datetime: string
        ip: string
        ips: string[]
        protocol: string
        secure: boolean
        method: string
        uri: string
        path: string
        hostname: string
        headers: Header[]
        raw_body: string
        parsed_body: any
        query: any
        cookies: any
    }

    interface BinConfig {
        response: {
            status_code: number
            headers: Header[]
            body: string
        }
        service: {
            delay: number
            ttl: number
        }
    }

    interface Bin {
        bin_id: BinId
        expire_at: string | null
        created_at: string
        endpoint: string
        request_count: number
        config: BinConfig
        user_id?: Uuid
    }

    type InputBinConfig = RecursivePartial<RequestCatcher.BinConfig>

}
