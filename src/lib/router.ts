import {Observable} from "rxjs";
import {CommandType, HTTPError, NativeRequestOptions, nothing, RequestMonitoring, send$} from "./utils";

export type PipeOperator = () => ((src:Observable<unknown | HTTPError>) => Observable<any>)

export class Router {

    constructor(
        public readonly headers: { [key: string]: string },
        public readonly basePath: string
    ) {
    }

    static defaultMethodMapping: Record<CommandType, 'GET' | 'POST' | 'PUT' | 'DELETE'> = {
        'upload': 'POST',
        'download': 'GET',
        'query': 'GET',
        'create': 'PUT',
        'update': 'POST',
        'delete': 'DELETE'
    }

    getHeaders(headers = {}) {
        return new Headers({ ...this.headers, ...headers })
    }

    send$<TResponse>({ command, path, requestOptions, monitoring }:
        {
            command: CommandType,
            path: string,
            requestOptions?: NativeRequestOptions,
            monitoring?: RequestMonitoring
        }
    ): Observable<TResponse | HTTPError> {

        requestOptions = requestOptions || {}

        if (!requestOptions.method)
            requestOptions.method = Router.defaultMethodMapping[command]

        let headers = { ...requestOptions.headers, ...this.headers }
        return send$(
            command,
            `${this.basePath}${path}`,
            { ...requestOptions, headers },
            monitoring
        ) as Observable<TResponse | HTTPError>
    }
}

export class RootRouter extends Router {

    static Headers: { [key: string]: string } = {}
    static HostName: string = "" // By default, relative resolution is used. Otherwise, protocol + hostname

    constructor(params: {
        basePath: string,
        headers?: { [key: string]: string }
    }) {
        super(
            {...RootRouter.Headers, ...(params.headers || {})},
            `${RootRouter.HostName}${params.basePath}`
        )
    }
}