import 'isomorphic-fetch'

export function mockRequest() {
    if (!globalThis.fetch) {
        globalThis.fetch = fetch
        globalThis.Headers = Headers
        globalThis.Request = Request
        globalThis.Response = Response
    }
}

mockRequest()
