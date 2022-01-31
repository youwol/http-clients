import {Observable} from 'rxjs';
import {HTTPError, nothing, RequestMonitoring} from '../utils';
import {RootRouter, PipeOperator} from '../router';
import {HealthzResponse} from './interfaces';
import {ApplicationsRouter} from './routers';

type DefaultPipe<U> = () => ((src:Observable<U | HTTPError>) => Observable<U>)
type TPipes<V> =  <U> () => ((src:Observable<U | HTTPError>) => Observable<V>)
type PipeResult<T extends TPipes<unknown>> = ReturnType<ReturnType<T>>

export class CdnSessionsStorageClient extends RootRouter {

    applications: ApplicationsRouter

    constructor({headers}:
                    {
                        headers?: { [_key: string]: any }
                    } = {}) {
        super({
            basePath: "/api/cdn-sessions-storage",
            headers
        })

        this.applications = new ApplicationsRouter(this)
    }

    /**
     * Healthz of the service
     *
     * @param monitoring
     * @returns response
     */
    getHealthz$(
        monitoring: RequestMonitoring = {}
    ) {

        return this.send$<HealthzResponse>({
            command: 'query',
            path: `/healthz`,
            monitoring
        })
    }
}
