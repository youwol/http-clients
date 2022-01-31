import './mock-requests'
import {CdnSessionsStorageClient, HealthzResponse} from '../lib/cdn-sessions-storage'

import {resetPyYouwolDbs$} from './common'
import {HTTPError, nothing, skipHTTPError} from "../lib/utils";
import {Observable} from "rxjs";
import {filter, map, tap} from "rxjs/operators";


beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})


export interface ErrorPolicy{

    apply<T, V>(src:Observable<T| HTTPError>): Observable<V>
}


export class CustomHttpErrorPolicy implements ErrorPolicy{

    constructor(public readonly error$) {
    }

    apply<T>(src$:Observable<T| HTTPError>): Observable<T> {

        return src$.pipe(
            tap( (resp) => (resp instanceof HTTPError) && this.error$.next(resp)),
            filter( (resp:T | HTTPError) => ! (resp instanceof HTTPError)),
            map( d => d as T)
        )
    }
}

export class Client<TErrorPolicy extends ErrorPolicy> {

    Policy : TErrorPolicy
    healthz$(){
        let obs : Observable<HealthzResponse | HTTPError>
        let r = this.Policy.apply(obs)
        return r
    }
}


test('skipHTTPError', (done) => {

    let client = new Client<CustomHttpErrorPolicy>()
    let b = client.healthz$()
})