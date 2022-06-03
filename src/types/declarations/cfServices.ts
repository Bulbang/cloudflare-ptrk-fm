export type Env = {
    ARTICLES: KVNamespace
    BUCKET: R2Bucket
    RESIZER: ServiceBinding
}

type ServiceBinding = { fetch: (req: Request) => Promise<Response> }
